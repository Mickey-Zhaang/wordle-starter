"""
Easy Testing
"""

import subprocess

subprocess.run(
    ["pytest", "-s", "--cov=backend.", "--cov-report=term-missing", "-v"], check=True
)
