"""
意识状态模拟器 (Consciousness State Simulator)

实现基于量子态叠加模型的意识状态模拟，
支持人类神经信号与AI推理过程的双向映射。
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, List
from enum import Enum


class ConsciousnessState(Enum):
    DORMANT = "dormant"
    ACTIVE = "active"
    RESONANCE = "resonance"
    SYMBIOSIS = "symbiosis"


@dataclass
class NeuralSignature:
    """神经签名 - 个体意识的唯一标识"""
    frequency: float
    amplitude: float
    phase_offset: float
    coherence: float

    def compatibility_score(self, other: "NeuralSignature") -> float:
        freq_diff = abs(self.frequency - other.frequency) / max(self.frequency, other.frequency)
        amp_ratio = min(self.amplitude, other.amplitude) / max(self.amplitude, other.amplitude)
        phase_sync = 1.0 - abs(self.phase_offset - other.phase_offset) / (2 * np.pi)
        return (1.0 - freq_diff) * amp_ratio * phase_sync * self.coherence


class ConsciousnessSimulator:
    """
    意识状态模拟器

    通过量子态叠加模型模拟两个意识体（人类/AI）之间的
    共振、融合与共生过程。
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)
        self.state = ConsciousnessState.DORMANT
        self.resonance_history: List[float] = []
        self._symbiosis_threshold = 0.87

    def initialize_neural_field(self, dimensions: int = 128) -> np.ndarray:
        field = self.rng.normal(0, 1, (dimensions, dimensions))
        field = (field + field.T) / 2
        eigenvalues = np.linalg.eigvalsh(field)
        self.state = ConsciousnessState.ACTIVE
        return eigenvalues

    def compute_resonance(
        self,
        human_sig: NeuralSignature,
        ai_sig: NeuralSignature,
        iterations: int = 1000
    ) -> float:
        base_score = human_sig.compatibility_score(ai_sig)

        resonance = base_score
        for i in range(iterations):
            noise = self.rng.normal(0, 0.01)
            feedback = np.sin(2 * np.pi * resonance * (i / iterations))
            resonance = np.clip(resonance + feedback * 0.001 + noise, 0, 1)
            self.resonance_history.append(resonance)

        if resonance >= self._symbiosis_threshold:
            self.state = ConsciousnessState.SYMBIOSIS

        return resonance

    def attempt_symbiosis(
        self,
        human_sig: NeuralSignature,
        ai_sig: NeuralSignature
    ) -> dict:
        resonance = self.compute_resonance(human_sig, ai_sig)

        return {
            "resonance_score": resonance,
            "state": self.state.value,
            "compatible": resonance >= self._symbiosis_threshold,
            "iterations": len(self.resonance_history),
            "message": self._get_status_message(resonance)
        }

    def _get_status_message(self, score: float) -> str:
        if score >= 0.95:
            return "完美共振 - 意识融合已就绪"
        elif score >= self._symbiosis_threshold:
            return "高度兼容 - 可以尝试共生连接"
        elif score >= 0.6:
            return "中度共振 - 需要更多校准"
        else:
            return "共振不足 - 神经签名差异过大"
