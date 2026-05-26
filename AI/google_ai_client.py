# google_ai_client.py
"""Utility module to upload model artifacts to Google Cloud Storage and
create/deploy a Vertex AI Model and Endpoint.

Usage (as a script)::

    python google_ai_client.py --bucket my-bucket \
        --project my-gcp-project --region us-central1 \
        --model-path ./saved_model/model.keras \
        --preproc-path ./saved_model/preprocessor.pkl \
        --model-display-name "Exam Score Predictor" \
        --endpoint-display-name "exam-score-endpoint"

The module can also be imported and used programmatically:

    from google_ai_client import upload_to_gcs, create_vertex_model, deploy_endpoint

All functions raise informative exceptions on failure.
"""

import argparse
import os
import sys
from pathlib import Path

from google.cloud import storage
from google.cloud import aiplatform
from google.api_core import exceptions as api_exceptions

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def upload_to_gcs(
    local_path: str,
    bucket_name: str,
    destination_blob_name: str = None,
) -> str:
    """Upload a local file or directory to a GCS bucket.

    Args:
        local_path: Path to the file or directory to upload.
        bucket_name: Target GCS bucket name.
        destination_blob_name: Optional path inside the bucket. If omitted, the
            basename of ``local_path`` is used.

    Returns:
        The full ``gs://`` URI of the uploaded artifact.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    local_path = Path(local_path).expanduser().resolve()
    if not local_path.exists():
        raise FileNotFoundError(f"{local_path} does not exist")

    if destination_blob_name is None:
        destination_blob_name = local_path.name

    if local_path.is_file():
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(str(local_path))
        return f"gs://{bucket_name}/{destination_blob_name}"
    else:
        # Recursively upload a directory preserving relative paths
        base_path = local_path
        for file_path in base_path.rglob("*"):
            if file_path.is_file():
                relative_path = file_path.relative_to(base_path)
                blob_name = os.path.join(destination_blob_name, str(relative_path))
                blob = bucket.blob(blob_name)
                blob.upload_from_filename(str(file_path))
        return f"gs://{bucket_name}/{destination_blob_name}"


def create_vertex_model(
    project_id: str,
    region: str,
    display_name: str,
    artifact_uri: str,
    container_image_uri: str = "us-docker.pkg.dev/vertex-ai/prediction/tf-cpu.2-11:latest",
) -> str:
    """Create a Vertex AI Model resource.

    Returns the model resource name (e.g. ``projects/123/locations/us-central1/models/456``).
    """
    aiplatform.init(project=project_id, location=region)
    try:
        model = aiplatform.Model.upload(
            display_name=display_name,
            artifact_uri=artifact_uri,
            serving_container_image_uri=container_image_uri,
            sync=True,
        )
        return model.resource_name
    except api_exceptions.GoogleAPICallError as e:
        raise RuntimeError(f"Failed to upload Vertex AI model: {e}")


def deploy_endpoint(
    project_id: str,
    region: str,
    model_resource_name: str,
    endpoint_display_name: str,
    machine_type: str = "n1-standard-4",
) -> str:
    """Create an endpoint (if needed) and deploy the given model.

    Returns the full endpoint resource name.
    """
    aiplatform.init(project=project_id, location=region)

    # Try to reuse an existing endpoint with the same display name
    endpoint = None
    for ep in aiplatform.Endpoint.list(filter=f"display_name={endpoint_display_name}"):
        endpoint = ep
        break
    if endpoint is None:
        endpoint = aiplatform.Endpoint.create(display_name=endpoint_display_name, sync=True)

    model = aiplatform.Model(model_resource_name)
    try:
        model.deploy(
            endpoint=endpoint,
            machine_type=machine_type,
            sync=True,
        )
    except api_exceptions.GoogleAPICallError as e:
        raise RuntimeError(f"Failed to deploy model to endpoint: {e}")

    return endpoint.resource_name

# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def _parse_args():
    parser = argparse.ArgumentParser(description="Upload model artifacts to GCS and deploy to Vertex AI")
    parser.add_argument("--bucket", required=True, help="GCS bucket name")
    parser.add_argument("--project", required=True, help="GCP project ID")
    parser.add_argument("--region", default="us-central1", help="Vertex AI region")
    parser.add_argument("--model-path", required=True, help="Local path to the TensorFlow SavedModel (.keras)")
    parser.add_argument("--preproc-path", required=True, help="Local path to the preprocessor .pkl file")
    parser.add_argument("--model-display-name", default="Exam Score Predictor", help="Display name for the Vertex AI model")
    parser.add_argument(
        "--endpoint-display-name", default="exam-score-endpoint", help="Display name for the Vertex AI endpoint"
    )
    parser.add_argument(
        "--machine-type", default="n1-standard-4", help="Machine type for endpoint deployment"
    )
    return parser.parse_args()


def main():
    args = _parse_args()

    # 1. Upload artifacts to GCS
    print("Uploading model files to GCS ...")
    model_uri = upload_to_gcs(args.model_path, args.bucket, "model")
    preproc_uri = upload_to_gcs(args.preproc_path, args.bucket, "preprocessor")
    # Vertex AI expects a single artifact URI that points to a directory containing both
    # files. For simplicity we upload them under the same prefix.
    artifact_uri = f"gs://{args.bucket}/"
    print(f"Artifacts uploaded to {artifact_uri}")

    # 2. Create Vertex AI Model
    print("Creating Vertex AI model ...")
    model_resource = create_vertex_model(
        project_id=args.project,
        region=args.region,
        display_name=args.model_display_name,
        artifact_uri=artifact_uri,
    )
    print(f"Vertex AI model created: {model_resource}")

    # 3. Deploy endpoint
    print("Deploying to Vertex AI endpoint ...")
    endpoint_resource = deploy_endpoint(
        project_id=args.project,
        region=args.region,
        model_resource_name=model_resource,
        endpoint_display_name=args.endpoint_display_name,
        machine_type=args.machine_type,
    )
    print(f"Model deployed to endpoint: {endpoint_resource}")

    print("\nAll steps completed successfully.")
    print("Set the following environment variables for your FastAPI server:")
    print(f"  USE_VERTEX=true")
    print(f"  VERTEX_ENDPOINT_ID={endpoint_resource}")

if __name__ == "__main__":
    main()
