import httpx
import pytest
from unittest.mock import patch
from install_bridge.api import SemanticAPIClient

@patch("install_bridge.api.client.get_config_value")
@patch("httpx.Client.post")
def test_api_client_success(mock_post, mock_config):
    mock_config.return_value = "http://test.com"

    mock_request = httpx.Request("POST", "http://test.com/semantic-index")
    mock_response = httpx.Response(200, json={"status": "success"}, request=mock_request)
    mock_post.return_value = mock_response

    client = SemanticAPIClient()
    response = client.index_payload({"test": "data"})

    assert response == {"status": "success"}
    mock_post.assert_called_once_with("http://test.com/semantic-index", json={"test": "data"})

@patch("install_bridge.api.client.get_config_value")
@patch("httpx.Client.post")
def test_api_client_http_error(mock_post, mock_config):
    mock_config.return_value = "http://test.com"

    mock_response = httpx.Response(500, request=httpx.Request("POST", "http://test.com/semantic-index"))
    mock_post.return_value = mock_response

    client = SemanticAPIClient()

    with pytest.raises(httpx.HTTPStatusError):
        client.index_payload({"test": "data"})
