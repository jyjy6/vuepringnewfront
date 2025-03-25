import type { Boxer } from "./BoxerTypes";

export interface P4P {
  id: number;
  boxer: Boxer; // Boxer와의 관계 설정
  p4pScore: number; // P4P 점수
  p4pRanking: number; // P4P 랭킹
  previousRanking: number; // 이전 랭킹
  rankingDate: string; // LocalDateTime -> ISO 문자열 (예: "2025-03-26T12:00:00")
  updateRankingDate: () => void; // 랭킹 업데이트 함수
}
