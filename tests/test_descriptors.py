from install_bridge.descriptors import YouTubeDescriptorGenerator, ArticleDescriptorGenerator

def test_youtube_descriptor():
    generator = YouTubeDescriptorGenerator()
    data = {
        "title": "Python Programming",
        "description": "Learn python fast.",
        "tags": ["coding", "python"]
    }
    descriptors = generator.generate(data)

    assert "keywords" in descriptors
    assert "categories" in descriptors
    assert "topics" in descriptors

    # We should have the provided tags
    assert "coding" in descriptors["keywords"]
    assert "python" in descriptors["keywords"]

def test_article_descriptor():
    generator = ArticleDescriptorGenerator()
    data = {
        "title": "AI in 2024",
        "summary": "AI is advancing rapidly.",
        "text": "Full text of the article goes here...",
        "keywords": ["ai", "future"]
    }
    descriptors = generator.generate(data)

    assert "keywords" in descriptors
    assert "topics" in descriptors
    assert "summary_length" in descriptors

    assert "ai" in descriptors["keywords"]
    assert "future" in descriptors["keywords"]
