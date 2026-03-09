"""
Easy Testing: run pytest from backend root with coverage on app modules.
"""

import subprocess
import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
subprocess.run(
    [
        sys.executable,
        "-m",
        "pytest",
        "tests/",
        "-s",
        "--cov=app",
        "--cov-report=term-missing",
        "-v",
    ],
    check=True,
    cwd=backend_root,
)
