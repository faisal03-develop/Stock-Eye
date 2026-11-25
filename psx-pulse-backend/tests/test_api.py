import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "disclaimer" in data


@pytest.mark.asyncio
async def test_dashboard_pulse(client):
    response = await client.get("/api/v1/dashboard/pulse")
    assert response.status_code == 200
    data = response.json()
    assert "kse100_summary" in data
    assert "top_opportunities" in data
    assert "watchlist_stocks" in data
    assert "disclaimer" in data
    assert len(data["top_opportunities"]) > 0


@pytest.mark.asyncio
async def test_stocks_screener(client):
    response = await client.get("/api/v1/stocks")
    assert response.status_code == 200
    data = response.json()
    assert "stocks" in data
    assert data["total"] >= 2
    symbols = [s["symbol"] for s in data["stocks"]]
    assert "SYS" in symbols
    assert "MEBL" in symbols

    sys_stock = next(s for s in data["stocks"] if s["symbol"] == "SYS")
    assert sys_stock["daily_upper_lock"] > sys_stock["current_price"]
    assert sys_stock["daily_lower_lock"] < sys_stock["current_price"]


@pytest.mark.asyncio
async def test_stocks_screener_filters(client):
    # Sector filter: Technology
    resp_tech = await client.get("/api/v1/stocks?sector=Technology")
    assert resp_tech.status_code == 200
    data_tech = resp_tech.json()
    for s in data_tech["stocks"]:
        assert s["sector"] == "Technology"

    # Search filter: MEBL
    resp_search = await client.get("/api/v1/stocks?search=MEBL")
    assert resp_search.status_code == 200
    data_search = resp_search.json()
    assert data_search["total"] == 1
    assert data_search["stocks"][0]["symbol"] == "MEBL"


@pytest.mark.asyncio
async def test_stock_forecast_sys(client):
    response = await client.get("/api/v1/stocks/SYS/forecast?horizon=15D")
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "SYS"
    assert data["current_price"] == 482.40
    assert "locks" in data
    assert data["locks"]["upper"] > 482.40
    assert data["locks"]["lower"] < 482.40

    assert "forecast_cone" in data
    assert len(data["forecast_cone"]) == 15

    # Check quantile monotonicity on forecast points
    for pt in data["forecast_cone"]:
        assert pt["p10"] <= pt["p50"] <= pt["p90"]

    assert "verdict" in data
    assert data["verdict"]["direction"] in ["BULLISH", "BEARISH", "NEUTRAL"]
    assert "explainability_drivers" in data
    assert len(data["explainability_drivers"]) == 3
    assert "sentiment_breakdown" in data
    assert "disclaimer" in data


@pytest.mark.asyncio
async def test_stock_forecast_not_found(client):
    response = await client.get("/api/v1/stocks/INVALID_TICKER/forecast")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_catalysts_endpoint(client):
    response = await client.get("/api/v1/catalysts/SYS")
    assert response.status_code == 200
    data = response.json()
    assert "catalysts" in data
    assert data["total"] >= 1
    cat = data["catalysts"][0]
    assert "headline" in cat
    assert "credibility_weight" in cat
    assert "disclaimer" in data


@pytest.mark.asyncio
async def test_watchlist_crud_flow(client):
    # 1. Add to watchlist
    add_resp = await client.post("/api/v1/watchlist", json={"symbol": "SYS"})
    assert add_resp.status_code == 201
    add_data = add_resp.json()
    assert any(item["symbol"] == "SYS" for item in add_data["items"])

    # 2. Get watchlist
    get_resp = await client.get("/api/v1/watchlist")
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert any(item["symbol"] == "SYS" for item in get_data["items"])

    # 3. Delete from watchlist
    del_resp = await client.delete("/api/v1/watchlist/SYS")
    assert del_resp.status_code == 200
    del_data = del_resp.json()
    assert not any(item["symbol"] == "SYS" for item in del_data["items"])


@pytest.mark.asyncio
async def test_model_accuracy_audit(client):
    response = await client.get("/api/v1/model/accuracy")
    assert response.status_code == 200
    data = response.json()
    assert data["hit_rate_90d"] == 76.4
    assert data["total_predictions"] == 1420
    assert len(data["sector_breakdown"]) > 0
    assert len(data["recent_closed_log"]) > 0
    assert "disclaimer" in data
