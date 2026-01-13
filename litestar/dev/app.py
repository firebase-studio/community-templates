from litestar import Litestar, get
from litestar.config.cors import CORSConfig
import uvicorn

@get("/")
async def home() -> dict:
    return {"message": "Now you can effortlessly create a REST API with Litestar!"}

cors_config = CORSConfig(
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = Litestar(route_handlers=[home], cors_config=cors_config)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0")
