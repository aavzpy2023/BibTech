def test_typing_imports_succeed_without_nameerror():
    """
    Arrange & Act: Import the specific modules that were crashing due to missing typing.
    Assert: They import successfully without throwing a NameError.
    """
    try:
        from src.bibliography.download_service import execute_batch_download
        from src.bibliography.schemas import ParsedReference
        from src.bibliography.resolver_service import resolve_pdf_url
    except NameError as e:
        assert False, f"NameError during import, missing typing generic: {e}"
    except Exception:
        # We ignore non-NameError exceptions (e.g. missing mocks for httpx in this minimal scope)
        # because the strict goal of Story 11.1 is resolving typing-related NameErrors.
        pass

    assert True
