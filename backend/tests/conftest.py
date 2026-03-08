"""
Pytest fixtures: path setup and shared TestClient.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient
from app.main import app

# Add backend root so "app" resolves when pytest is run from any cwd
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)


def pytest_configure(config):
    """
    allows for async testing
    """
    config.addinivalue_line("markers", "asyncio: mark test as async")


@pytest.fixture
def client():
    """
    Reusable test client bound to the FastAPI app.
    """
    return TestClient(app)
