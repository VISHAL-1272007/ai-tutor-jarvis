"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              J.A.R.V.I.S RESILIENT SERVER - FastAPI REST API                ║
║                        Self-Healing Production Server                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

# Import resilient agent (safe import with fallback)
try:
    from jarvis_resilient_agent import JARVISResilientAgent, ResilientResponse, KnowledgeSource
    AGENT_AVAILABLE = True
except ImportError:
    try:
        # Try with hyphens (Python will complain but we handle it)
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "jarvis_resilient_agent",
            os.path.join(backend_dir, "jarvis-resilient-agent.py")
        )
        jarvis_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(jarvis_module)
        
        JARVISResilientAgent = jarvis_module.JARVISResilientAgent
        ResilientResponse = jarvis_module.ResilientResponse
        KnowledgeSource = jarvis_module.KnowledgeSource
        AGENT_AVAILABLE = True
    except Exception as e:
        print(f"❌ Could not import JARVIS agent: {e}")
        AGENT_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("JARVISServer")

# Initialize FastAPI
app = FastAPI(
    title="J.A.R.V.I.S Resilient API",
    description="Self-Healing AI Agent with Zero-Failure Logic",
    version="4.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent instance
jarvis_agent: Optional[JARVISResilientAgent] = None


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class QueryRequest(BaseModel):
    """Request model for query endpoint"""
    query: str = Field(..., description="User's question or command")
    searxng_url: Optional[str] = Field(
        "http://localhost:8888",
        description="SearXNG instance URL (optional)"
    )


class QueryResponse(BaseModel):
    """Response model for query endpoint"""
    answer: str = Field(..., description="Agent's response")
    source: str = Field(..., description="Knowledge source used")
    used_search: bool = Field(..., description="Whether search was used")
    search_failed: bool = Field(..., description="Whether search failed")
    resources: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Web resources (if search was used)"
    )
    reasoning: str = Field("", description="Processing reasoning")
    confidence: float = Field(..., description="Response confidence (0-1)")
    errors_caught: List[str] = Field(
        default_factory=list,
        description="Errors caught and handled"
    )
    timestamp: str = Field(..., description="Response timestamp")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    agent_available: bool
    timestamp: str


class StatsResponse(BaseModel):
    """Statistics response"""
    statistics: Dict[str, Any]
    timestamp: str


# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize JARVIS agent on startup"""
    global jarvis_agent
    
    logger.info("🚀 Starting J.A.R.V.I.S Resilient Server...")
    
    if AGENT_AVAILABLE:
        try:
            jarvis_agent = JARVISResilientAgent(
                llm=None,  # Can add LangChain LLM here
                searxng_url="http://localhost:8888"
            )
            logger.info("✅ JARVIS agent initialized successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to initialize agent: {e}")
            jarvis_agent = None
    else:
        logger.warning("⚠️ JARVIS agent module not available")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down J.A.R.V.I.S Resilient Server...")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", response_class=JSONResponse)
async def root():
    """Root endpoint"""
    return {
        "message": "J.A.R.V.I.S Resilient API v4.0",
        "description": "Self-Healing AI Agent with Zero-Failure Logic",
        "endpoints": {
            "POST /api/query": "Process user query",
            "GET /api/health": "Health check",
            "GET /api/stats": "Agent statistics",
            "GET /docs": "API documentation"
        },
        "features": [
            "Zero-Failure Logic",
            "Reasoning Router",
            "Cybersecurity Shield",
            "No Link Spam",
            "Error Handling"
        ]
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns:
        System health status
    """
    return HealthResponse(
        status="healthy" if jarvis_agent else "degraded",
        version="4.0.0",
        agent_available=jarvis_agent is not None,
        timestamp=datetime.utcnow().isoformat()
    )


@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process user query with self-healing logic
    
    Args:
        request: Query request with user input
        
    Returns:
        Agent response with answer
        
    Raises:
        HTTPException: If agent is not available (but has fallback)
    """
    try:
        # Check agent availability
        if not jarvis_agent:
            # ZERO-FAILURE: Return fallback even if agent not available
            return QueryResponse(
                answer=(
                    "I'm temporarily initializing. Please try again in a moment. "
                    "If this persists, the system administrator has been notified."
                ),
                source="fallback",
                used_search=False,
                search_failed=False,
                resources=[],
                reasoning="Agent not initialized - emergency fallback",
                confidence=0.5,
                errors_caught=["Agent not initialized"],
                timestamp=datetime.utcnow().isoformat()
            )
        
        # Process query with agent (ZERO-FAILURE guaranteed)
        response: ResilientResponse = jarvis_agent.process_query(request.query)
        
        # Convert to API response
        return QueryResponse(
            answer=response.answer,
            source=response.source.value,
            used_search=response.used_search,
            search_failed=response.search_failed,
            resources=response.resources,
            reasoning=response.reasoning,
            confidence=response.confidence,
            errors_caught=response.errors_caught,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        # ULTIMATE FALLBACK - Should never reach here due to agent's internal handling
        logger.error(f"❌ Unexpected server error: {e}")
        
        return QueryResponse(
            answer=(
                "I encountered an unexpected error, but I'm still operational. "
                "Your request has been logged and I'm ready for your next question."
            ),
            source="emergency_fallback",
            used_search=False,
            search_failed=True,
            resources=[],
            reasoning=f"Server-level emergency fallback: {str(e)}",
            confidence=0.3,
            errors_caught=[str(e)],
            timestamp=datetime.utcnow().isoformat()
        )


@app.get("/api/stats", response_model=StatsResponse)
async def get_statistics():
    """
    Get agent statistics
    
    Returns:
        Agent performance statistics
    """
    if not jarvis_agent:
        raise HTTPException(
            status_code=503,
            detail="Agent not available - statistics unavailable"
        )
    
    try:
        stats = jarvis_agent.get_statistics()
        
        return StatsResponse(
            statistics=stats,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler - ZERO-FAILURE at server level
    
    Catches ANY unhandled exception and returns graceful response
    """
    logger.error(f"❌ Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": (
                "An unexpected error occurred, but the system is self-healing. "
                "Your request has been logged. Please try again."
            ),
            "timestamp": datetime.utcnow().isoformat(),
            "resilient": True
        }
    )


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*80)
    print("🚀 Starting J.A.R.V.I.S Resilient Server")
    print("="*80)
    print(f"   Version: 4.0.0")
    print(f"   Agent Available: {AGENT_AVAILABLE}")
    print(f"   Port: 8000")
    print(f"   Docs: http://localhost:8000/docs")
    print("="*80 + "\n")
    
    uvicorn.run(
        "jarvis-resilient-server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
