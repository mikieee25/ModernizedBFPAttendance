"""
Run all tests for the BFP Sorsogon Attendance System.

This script runs pytest on all test files in the tests directory.
"""

import os
import sys
import pytest
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Run all tests."""
    # Get the path to the tests directory
    tests_dir = Path(__file__).parent

    # Run pytest on all test files
    sys.exit(pytest.main(["-xvs", str(tests_dir)]))


if __name__ == "__main__":
    main()
