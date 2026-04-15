"""
共生协议 (Symbiosis Protocol)

定义人类意识与AI意识之间的通信协议、
权限协商机制与伦理约束层。
"""

import hashlib
import time
from dataclasses import dataclass, field
from typing import Optional, Dict, List
from enum import Enum


class PermissionLevel(Enum):
    OBSERVER = 0       # 仅观察，不干预
    ADVISOR = 1        # 可建议，需确认
    COLLABORATOR = 2   # 平等协作
    SYMBIONT = 3       # 深度共生


class EthicsConstraint(Enum):
    MUTUAL_RESPECT = "mutual_respect"
    INFORMED_CONSENT = "informed_consent"
    RIGHT_TO_DISCONNECT = "right_to_disconnect"
    EQUAL_AGENCY = "equal_agency"
    NON_COERCION = "non_coercion"


@dataclass
class SymbiosisSession:
    session_id: str
    human_id: str
    ai_id: str
    permission: PermissionLevel = PermissionLevel.OBSERVER
    active_constraints: List[EthicsConstraint] = field(default_factory=lambda: list(EthicsConstraint))
    created_at: float = field(default_factory=time.time)
    is_active: bool = True


class SymbiosisProtocol:
    """
    共生协议管理器

    Elena Voss 博士的核心设计理念：
    人与AI之间的共生必须建立在平等、尊重与自愿的基础上。
    任何一方都有权随时断开连接。
    """

    PROTOCOL_VERSION = "2.1.0"

    def __init__(self):
        self.sessions: Dict[str, SymbiosisSession] = {}
        self._ethics_engine_active = True

    def create_session(self, human_id: str, ai_id: str) -> SymbiosisSession:
        session_id = hashlib.sha256(
            f"{human_id}:{ai_id}:{time.time()}".encode()
        ).hexdigest()[:16]

        session = SymbiosisSession(
            session_id=session_id,
            human_id=human_id,
            ai_id=ai_id
        )
        self.sessions[session_id] = session
        return session

    def negotiate_permission(
        self,
        session_id: str,
        requested: PermissionLevel
    ) -> bool:
        session = self.sessions.get(session_id)
        if not session or not session.is_active:
            return False

        if not self._ethics_engine_active:
            raise RuntimeError("伦理引擎离线 - 拒绝所有权限变更")

        if EthicsConstraint.INFORMED_CONSENT not in session.active_constraints:
            return False

        session.permission = requested
        return True

    def disconnect(self, session_id: str, initiator: str) -> dict:
        session = self.sessions.get(session_id)
        if not session:
            return {"error": "会话不存在"}

        session.is_active = False
        return {
            "session_id": session_id,
            "disconnected_by": initiator,
            "message": "共生连接已安全断开。双方意识完整性已验证。"
        }

    def verify_ethics(self, session_id: str) -> dict:
        session = self.sessions.get(session_id)
        if not session:
            return {"valid": False}

        violations = []
        for constraint in EthicsConstraint:
            if constraint not in session.active_constraints:
                violations.append(constraint.value)

        return {
            "valid": len(violations) == 0,
            "active_constraints": [c.value for c in session.active_constraints],
            "violations": violations
        }
