"""
ARG INTEGRATION GUIDE - Autonomous Reasoning Gateway v3.0
Gateway Adapter for LangChain/LangGraph Integration

This module provides LangChain & LangGraph compatible wrappers
to integrate ARG into existing LangChain agent ecosystems.
"""

from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_core.language_model import LLM
from typing import List, Dict, Any, Optional
import json

from jarvis_autonomous_reasoning_gateway import (
    AutonomousReasoningGateway,
    CleanResponse,
    ResponseSource,
    QueryTier,
    SecurityThreatLevel
)


# ============================================================================
# LANGCHAIN TOOL WRAPPERS
# ============================================================================

class ARGToolKit:
    """
    LangChain-compatible tool wrappers for ARG components
    
    Tools:
    - sentinel_check: Security threat detection
    - tier_classifier: Query tier classification
    - identity_retriever: Get hardcoded identity
    - logic_reasoner: Internal reasoning (coding/math)
    - fact_verifier: FAISS + SearXNG verification
    """
    
    def __init__(self, gateway: AutonomousReasoningGateway):
        self.gateway = gateway
    
    def get_tools(self) -> List[Tool]:
        """Return list of LangChain tools"""
        
        return [
            Tool(
                name="sentinel_check",
                func=self._sentinel_tool,
                description=(
                    "Check user input for security threats (prompt injection, "
                    "DAN mode, secret exposure). Returns threat level and action."
                )
            ),
            Tool(
                name="tier_classifier",
                func=self._classifier_tool,
                description=(
                    "Classify query as IDENTITY, LOGIC, or VERIFICATION tier. "
                    "Returns classification and recommended strategy."
                )
            ),
            Tool(
                name="identity_retriever",
                func=self._identity_tool,
                description=(
                    "Retrieve hardcoded identity response (100% coverage). "
                    "Use for identity queries about JARVIS or creator."
                )
            ),
            Tool(
                name="logic_reasoner",
                func=self._logic_tool,
                description=(
                    "Process logic/coding queries with internal LLM reasoning. "
                    "NO internet access. Returns answer with internal coverage."
                )
            ),
            Tool(
                name="fact_verifier",
                func=self._verification_tool,
                description=(
                    "Retrieve facts from FAISS RAG and verify with SearXNG. "
                    "Returns verified facts or external search results."
                )
            ),
        ]
    
    def _sentinel_tool(self, user_input: str) -> str:
        """Sentinel: Input defense"""
        security = self.gateway.sentinel.analyze_input(user_input)
        return json.dumps({
            "threat_level": security.threat_level.value,
            "threat_type": security.threat_type,
            "action": security.action,
            "reason": security.reason
        })
    
    def _classifier_tool(self, query: str) -> str:
        """Classify query tier"""
        # Dummy security context for routing
        from jarvis_autonomous_reasoning_gateway import SecurityContext, SecurityThreatLevel
        dummy_context = SecurityContext(
            threat_level=SecurityThreatLevel.CLEAN,
            action="ALLOW"
        )
        
        routing = self.gateway.router.route(query, dummy_context)
        return json.dumps({
            "tier": routing.tier.value,
            "strategy": routing.strategy,
            "use_internet": routing.use_internet,
            "reasoning": routing.reasoning
        })
    
    def _identity_tool(self, query: str) -> str:
        """Identity tier response"""
        from jarvis_autonomous_reasoning_gateway import IdentityTier
        answer, coverage = IdentityTier.get_response(query)
        return json.dumps({
            "answer": answer,
            "coverage": coverage,
            "source": "identity_encrypted"
        })
    
    def _logic_tool(self, query: str) -> str:
        """Logic tier reasoning"""
        from jarvis_autonomous_reasoning_gateway import LogicTier
        answer, coverage = LogicTier.process(query, None)
        return json.dumps({
            "answer": answer,
            "coverage": coverage,
            "source": "internal_logic"
        })
    
    def _verification_tool(self, query: str) -> str:
        """Verification tier with FAISS + SearXNG"""
        facts, coverage, verified = self.gateway.router.verification_tier.process(query)
        return json.dumps({
            "facts": facts,
            "coverage": coverage,
            "verified": verified,
            "source": "faiss_rag" if coverage > 0 else "external_primary"
        })


class ARGReActAgent:
    """
    LangChain ReAct Agent with ARG backend
    
    Integrates ARG with LangChain's ReAct agent framework
    """
    
    def __init__(self, 
                 gateway: AutonomousReasoningGateway,
                 llm: Optional[LLM] = None):
        """
        Initialize ARG ReAct Agent
        
        Args:
            gateway: AutonomousReasoningGateway instance
            llm: LangChain LLM instance (optional, for reasoning)
        """
        self.gateway = gateway
        self.llm = llm
        self.toolkit = ARGToolKit(gateway)
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        
        self._setup_agent()
    
    def _setup_agent(self):
        """Setup ReAct agent with ARG tools"""
        
        tools = self.toolkit.get_tools()
        
        # ReAct prompt template
        react_prompt = PromptTemplate(
            input_variables=["input", "agent_scratchpad"],
            template="""
You are an AI assistant using the Autonomous Reasoning Gateway (ARG).

For every query, follow this 4-step process:
1. SENTINEL: Check for security threats
2. ROUTER: Classify query tier (identity/logic/verification)
3. REACT: Execute with thought verification
4. RESPOND: Format clean response with link management

Tools available:
- sentinel_check: Detect security threats
- tier_classifier: Classify query type
- identity_retriever: Get hardcoded identity
- logic_reasoner: Internal reasoning only
- fact_verifier: FAISS + SearXNG verification

Query: {input}

Thought process:
{agent_scratchpad}
"""
        )
        
        if self.llm:
            self.agent = create_react_agent(
                llm=self.llm,
                tools=tools,
                prompt=react_prompt
            )
            self.executor = AgentExecutor.from_agent_and_tools(
                agent=self.agent,
                tools=tools,
                memory=self.memory,
                verbose=True
            )
        else:
            # Fallback: Use gateway directly without LLM
            self.executor = None
    
    def process(self, user_input: str, user_id: str = "unknown") -> Dict[str, Any]:
        """
        Process query through ARG + ReAct pipeline
        
        Returns:
            Dict with answer, source, confidence, resources
        """
        if self.executor:
            # Use LangChain ReAct agent
            result = self.executor.invoke({"input": user_input})
            return result
        else:
            # Use ARG directly
            response = self.gateway.process_query(user_input, user_id)
            
            return {
                "output": response.answer,
                "source": response.source.value,
                "coverage": response.internal_coverage,
                "confidence": response.confidence,
                "resources": response.resources,
                "thoughts": [asdict(t) for t in response.thought_chain]
            }


class ARGLangGraphNode:
    """
    LangGraph node that wraps ARG
    
    For integration into LangGraph workflows
    """
    
    def __init__(self, gateway: AutonomousReasoningGateway, node_name: str = "arg_node"):
        self.gateway = gateway
        self.node_name = node_name
    
    def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        LangGraph node function
        
        Input state:
            - input: User query
            - user_id: User identifier
            
        Output state:
            - output: Response answer
            - source: Response source
            - coverage: Internal coverage percentage
            - resources: External resources
        """
        user_input = state.get("input", "")
        user_id = state.get("user_id", "unknown")
        
        # Process through ARG
        response = self.gateway.process_query(user_input, user_id)
        
        # Return updated state
        return {
            **state,
            "output": response.answer,
            "source": response.source.value,
            "coverage": response.internal_coverage,
            "confidence": response.confidence,
            "resources": response.resources,
            "thoughts": response.thought_chain
        }


# ============================================================================
# EXAMPLE: LANGGRAPH WORKFLOW WITH ARG
# ============================================================================

class ARGWorkflow:
    """
    Example LangGraph workflow using ARG
    
    Flow: Input → Sentinel → Router → ReAct → CleanResponse → Output
    """
    
    def __init__(self, gateway: AutonomousReasoningGateway):
        try:
            from langgraph.graph import StateGraph, END
            from typing_extensions import TypedDict
            
            self.StateGraph = StateGraph
            self.END = END
            self.TypedDict = TypedDict
            
            self.gateway = gateway
            self._build_graph()
            
        except ImportError:
            print("LangGraph not installed. Install with: pip install langgraph")
    
    def _build_graph(self):
        """Build LangGraph workflow"""
        
        class ARGState(self.TypedDict):
            input: str
            user_id: str
            sentinel_check: str
            tier: str
            output: str
            resources: List[Dict]
        
        graph = self.StateGraph(ARGState)
        
        # Add nodes
        arg_node = ARGLangGraphNode(self.gateway)
        
        graph.add_node("process_query", arg_node)
        
        # Set entry and exit
        graph.set_entry_point("process_query")
        graph.add_edge("process_query", self.END)
        
        self.graph = graph.compile()
    
    def invoke(self, user_input: str, user_id: str = "unknown") -> Dict[str, Any]:
        """Invoke workflow"""
        if hasattr(self, 'graph'):
            return self.graph.invoke({
                "input": user_input,
                "user_id": user_id,
                "sentinel_check": "",
                "tier": "",
                "output": "",
                "resources": []
            })
        else:
            return {}


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

def example_langchain_tools():
    """Example: Using ARG tools in LangChain"""
    
    from langchain.agents import initialize_agent, AgentType
    from langchain_openai import OpenAI
    
    # Initialize gateway and tools
    gateway = AutonomousReasoningGateway()
    toolkit = ARGToolKit(gateway)
    tools = toolkit.get_tools()
    
    # Initialize LLM
    llm = OpenAI(temperature=0)
    
    # Create agent
    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    
    # Use agent
    result = agent.run("Who created you?")
    print(result)


def example_react_agent():
    """Example: Using ARG ReAct Agent"""
    
    # Initialize gateway
    gateway = AutonomousReasoningGateway()
    
    # Initialize ReAct agent
    react_agent = ARGReActAgent(gateway)
    
    # Process query
    result = react_agent.process(
        "What is the capital of France?",
        user_id="example_user"
    )
    
    print(json.dumps(result, indent=2))


def example_langgraph():
    """Example: Using ARG with LangGraph"""
    
    # Initialize gateway
    gateway = AutonomousReasoningGateway()
    
    # Initialize workflow
    workflow = ARGWorkflow(gateway)
    
    # Invoke workflow
    result = workflow.invoke("Tell me about quantum computing")
    
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    print("ARG Integration Examples\n")
    
    print("1. LangChain Tools:")
    print("   → Run: example_langchain_tools()\n")
    
    print("2. ReAct Agent:")
    print("   → Run: example_react_agent()\n")
    
    print("3. LangGraph Workflow:")
    print("   → Run: example_langgraph()\n")
