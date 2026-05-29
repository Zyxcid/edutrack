from __future__ import annotations

import io
from pathlib import Path

import pandas as pd
import streamlit as st


st.set_page_config(page_title="Student Performance Dashboard", layout="wide")


DATA_PATH = Path(__file__).resolve().parent / "datascience" / "StudentPerformanceFactors.csv"

NUMERIC_COLUMNS = [
	"Hours_Studied",
	"Attendance",
	"Sleep_Hours",
	"Previous_Scores",
	"Tutoring_Sessions",
	"Physical_Activity",
	"Exam_Score",
]

CATEGORICAL_FILTER_COLUMNS = [
	"Gender",
	"School_Type",
	"Family_Income",
	"Motivation_Level",
	"Internet_Access",
	"Extracurricular_Activities",
]


@st.cache_data(show_spinner=False)
def read_csv_path(path: str) -> pd.DataFrame:
	return pd.read_csv(path)


def normalize_df(df: pd.DataFrame) -> pd.DataFrame:
	df = df.copy()
	df.columns = [str(c).strip() for c in df.columns]
	for col in NUMERIC_COLUMNS:
		if col in df.columns:
			df[col] = pd.to_numeric(df[col], errors="coerce")
	return df


def binned_counts(series: pd.Series, bins: int = 20) -> pd.Series:
	s = pd.to_numeric(series, errors="coerce").dropna()
	if s.empty:
		return pd.Series(dtype="int64")
	binned = pd.cut(s, bins=bins)
	counts = binned.value_counts().sort_index()
	counts.index = counts.index.astype(str)
	return counts


st.title("Student Performance Dashboard")
st.caption("Dashboard untuk dataset StudentPerformanceFactors.csv")

if not DATA_PATH.exists():
	st.error(
		"File tidak ditemukan. Pastikan file ada di: "
		f"{DATA_PATH}. (Letakkan StudentPerformanceFactors.csv di folder datascience/)"
	)
	st.stop()

try:
	df = normalize_df(read_csv_path(str(DATA_PATH)))
except Exception as exc:
	st.error(f"Gagal membaca CSV: {exc}")
	st.stop()

with st.sidebar:
	st.header("Data")
	st.markdown(f"**File digunakan:** {DATA_PATH.name}")
	st.caption(f"Lokasi: {DATA_PATH.parent}")

df_filtered = df.copy()

with st.sidebar:
	st.header("Filter")

	for col in CATEGORICAL_FILTER_COLUMNS:
		if col not in df.columns:
			continue
		options = sorted(df[col].dropna().unique().tolist())
		if not options:
			continue
		selected = st.multiselect(col, options, default=options)
		if set(selected) != set(options):
			df_filtered = df_filtered[df_filtered[col].isin(selected)]

	for col in ("Hours_Studied", "Attendance", "Sleep_Hours", "Exam_Score"):
		if col not in df_filtered.columns:
			continue
		s = pd.to_numeric(df_filtered[col], errors="coerce").dropna()
		if s.empty:
			continue
		min_val = float(s.min())
		max_val = float(s.max())
		if min_val == max_val:
			continue
		low, high = st.slider(col, min_value=min_val, max_value=max_val, value=(min_val, max_val))
		df_filtered = df_filtered[pd.to_numeric(df_filtered[col], errors="coerce").between(low, high)]

if df_filtered.empty:
	st.warning("Tidak ada data yang cocok dengan filter yang dipilih.")
	st.stop()

st.caption(f"Menampilkan {len(df_filtered)} baris dari total {len(df)} baris.")

tab_summary, tab_charts, tab_quality = st.tabs(["Ringkasan", "Grafik", "Kualitas Data"])

with tab_summary:
	st.subheader("Key Metrics")

	missing_total = int(df_filtered.isna().sum().sum())
	duplicate_total = int(df_filtered.duplicated().sum())

	k1, k2, k3, k4 = st.columns(4)
	k1.metric("Baris", value=len(df_filtered))
	k2.metric("Kolom", value=len(df_filtered.columns))
	k3.metric("Missing values", value=missing_total)
	k4.metric("Duplikat", value=duplicate_total)

	if "Exam_Score" in df_filtered.columns:
		exam = pd.to_numeric(df_filtered["Exam_Score"], errors="coerce").dropna()
		if not exam.empty:
			m1, m2, m3, m4 = st.columns(4)
			m1.metric("Rata-rata Exam_Score", value=round(float(exam.mean()), 2))
			m2.metric("Median Exam_Score", value=round(float(exam.median()), 2))
			m3.metric("Min Exam_Score", value=round(float(exam.min()), 2))
			m4.metric("Max Exam_Score", value=round(float(exam.max()), 2))

	st.subheader("Preview")
	st.dataframe(df_filtered.head(50), width="stretch")

	csv_bytes = df_filtered.to_csv(index=False).encode("utf-8")
	st.download_button(
		"Unduh CSV (filtered)",
		data=csv_bytes,
		file_name="StudentPerformanceFactors_filtered.csv",
		mime="text/csv",
	)

with tab_charts:
	if "Exam_Score" in df_filtered.columns:
		st.subheader("Distribusi Exam_Score")
		counts = binned_counts(df_filtered["Exam_Score"], bins=20)
		if not counts.empty:
			st.bar_chart(counts)

	if {"Hours_Studied", "Exam_Score"}.issubset(df_filtered.columns):
		st.subheader("Hours_Studied vs Exam_Score")
		scatter_df = df_filtered[["Hours_Studied", "Exam_Score"]].dropna()
		if not scatter_df.empty:
			st.scatter_chart(scatter_df, x="Hours_Studied", y="Exam_Score")

	if {"Attendance", "Exam_Score"}.issubset(df_filtered.columns):
		st.subheader("Attendance vs Exam_Score")
		scatter_df = df_filtered[["Attendance", "Exam_Score"]].dropna()
		if not scatter_df.empty:
			st.scatter_chart(scatter_df, x="Attendance", y="Exam_Score")

	numeric_df = df_filtered.select_dtypes(include="number")
	if "Exam_Score" in numeric_df.columns and len(numeric_df.columns) > 1:
		st.subheader("Korelasi Numerik terhadap Exam_Score")
		corr = numeric_df.corr(numeric_only=True)["Exam_Score"].drop(labels=["Exam_Score"]).dropna()
		corr = corr.reindex(corr.abs().sort_values(ascending=False).index)
		st.dataframe(corr.to_frame("corr").head(10), width="stretch")
		st.bar_chart(corr.head(10))

	group_candidates = [
		c
		for c in [
			"Gender",
			"School_Type",
			"Family_Income",
			"Motivation_Level",
			"Access_to_Resources",
			"Parental_Involvement",
			"Internet_Access",
			"Extracurricular_Activities",
		]
		if c in df_filtered.columns
	]
	if "Exam_Score" in df_filtered.columns and group_candidates:
		st.subheader("Rata-rata Exam_Score per Kategori")
		group_col = st.selectbox("Kelompokkan berdasarkan", options=group_candidates)

		tmp = df_filtered[[group_col, "Exam_Score"]].copy()
		tmp[group_col] = tmp[group_col].fillna("Missing")
		grouped = (
			tmp.groupby(group_col)["Exam_Score"]
			.agg(mean="mean", count="size")
			.sort_values(by="mean", ascending=False)
		)

		st.dataframe(grouped, width="stretch")
		st.bar_chart(grouped["mean"])

with tab_quality:
	st.subheader("Missing Values per Kolom")
	missing = df_filtered.isna().sum()
	missing_pct = (missing / len(df_filtered) * 100).round(2)
	missing_df = (
		pd.DataFrame({"missing": missing, "missing_%": missing_pct})
		.sort_values(by="missing", ascending=False)
		.reset_index(names="column")
	)
	st.dataframe(missing_df, width="stretch")

	st.subheader("Tipe Data & Ringkasan Kolom")
	col_info = pd.DataFrame(
		{
			"dtype": df_filtered.dtypes.astype(str),
			"non_null": df_filtered.notna().sum(),
			"unique": df_filtered.nunique(dropna=True),
		}
	).reset_index(names="column")
	st.dataframe(col_info, width="stretch")

	numeric_df = df_filtered.select_dtypes(include="number")
	if not numeric_df.empty:
		st.subheader("Statistik Numerik")
		st.dataframe(numeric_df.describe().T, width="stretch")

	checks: list[dict[str, object]] = []

	def add_check(label: str, mask: pd.Series):
		count = int(mask.sum())
		if count > 0:
			checks.append({"check": label, "count": count})

	if "Hours_Studied" in df_filtered.columns:
		s = pd.to_numeric(df_filtered["Hours_Studied"], errors="coerce")
		add_check("Hours_Studied > 24", s > 24)

	if "Sleep_Hours" in df_filtered.columns:
		s = pd.to_numeric(df_filtered["Sleep_Hours"], errors="coerce")
		add_check("Sleep_Hours > 24", s > 24)

	if "Attendance" in df_filtered.columns:
		s = pd.to_numeric(df_filtered["Attendance"], errors="coerce")
		add_check("Attendance > 100", s > 100)
		add_check("Attendance < 0", s < 0)

	if checks:
		st.subheader("Pemeriksaan Nilai di Luar Rentang Umum")
		st.warning("Ada beberapa nilai yang berada di luar rentang umum (cek kembali data sumber).")
		st.dataframe(pd.DataFrame(checks), width="stretch")
