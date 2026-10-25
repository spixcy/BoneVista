from abc import ABC, abstractmethod


class InferenceAdapter(ABC):
    """Abstract interface for X-ray-to-3D inference models."""

    @abstractmethod
    def is_available(self) -> bool:
        """Return True only if verified weights and dependencies are usable."""
        pass

    @abstractmethod
    def get_mode(self) -> str:
        """Return 'unavailable' or 'research'. Never 'clinical'."""
        pass

    @abstractmethod
    def get_model_identifier(self) -> str | None:
        """Return human-readable model/checkpoint identifier."""
        pass

    @abstractmethod
    def get_supported_anatomies(self) -> list[str]:
        """Return list of machine-readable supported anatomy tokens."""
        pass

    @abstractmethod
    def get_input_constraints(self) -> list[str]:
        """Return constraints or warnings for client."""
        pass

    @abstractmethod
    def get_unavailable_reason(self) -> str | None:
        """Return reason when unavailable."""
        pass

    @abstractmethod
    def run_inference(self, ap_bytes: bytes, lat_bytes: bytes, anatomy: str) -> bytes:
        """Run genuine model inference and return binary GLB bytes."""
        pass


class UnavailableInferenceAdapter(InferenceAdapter):
    """Default adapter truthfully reporting no configured inference checkpoint."""

    def is_available(self) -> bool:
        return False

    def get_mode(self) -> str:
        return "unavailable"

    def get_model_identifier(self) -> str | None:
        return None

    def get_supported_anatomies(self) -> list[str]:
        return []

    def get_input_constraints(self) -> list[str]:
        return ["A verified compatible checkpoint is not configured."]

    def get_unavailable_reason(self) -> str | None:
        return "No verified inference checkpoint is configured."

    def run_inference(self, ap_bytes: bytes, lat_bytes: bytes, anatomy: str) -> bytes:
        raise RuntimeError("Inference cannot be executed: No verified checkpoint configured.")


class ModelRegistry:
    """Registry maintaining active inference adapter."""

    def __init__(self, adapter: InferenceAdapter | None = None):
        self._adapter: InferenceAdapter = adapter or UnavailableInferenceAdapter()

    @property
    def adapter(self) -> InferenceAdapter:
        return self._adapter

    def set_adapter(self, adapter: InferenceAdapter) -> None:
        self._adapter = adapter

    def reset(self) -> None:
        self._adapter = UnavailableInferenceAdapter()


model_registry = ModelRegistry()
