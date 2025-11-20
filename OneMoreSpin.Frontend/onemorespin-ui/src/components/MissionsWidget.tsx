import React, { useEffect, useState } from "react";
import { api } from "../api";
import type { UserMissionVm } from "../api";
import { on, off } from "../events";
import "../styles/MissionsWidget.css";

interface MissionsWidgetProps {
  onRewardClaimed?: () => void;
}

export const MissionsWidget: React.FC<MissionsWidgetProps> = ({ onRewardClaimed }) => {
  const [missions, setMissions] = useState<UserMissionVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMissions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.missions.getUserMissions();
      console.debug("[MissionsWidget] raw missions response", data);
      
      // mapping
      type BackendMission = {
        missionId: number;
        name: string;
        description: string;
        currentProgress: number;
        requiredAmount: number;
        rewardAmount: number;
        isCompleted: boolean;
        isClaimed: boolean;
      };
      
      const normalized = ((data as unknown) as BackendMission[]).map((m) => ({
        MissionId: m.missionId,
        Name: m.name,
        Description: m.description,
        CurrentProgress: m.currentProgress,
        RequiredAmount: m.requiredAmount,
        RewardAmount: m.rewardAmount,
        IsCompleted: m.isCompleted,
        IsClaimed: m.isClaimed,
      }));
      
      console.debug("[MissionsWidget] normalized missions", normalized);
      setMissions(normalized);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd ładowania misji");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    const handler = () => fetchMissions();
    on("missions:refresh", handler);
    return () => off("missions:refresh", handler);
  }, []);

  const handleClaim = async (missionId: number) => {
    setClaimingId(missionId);
    setError("");
    try {
      const res = await api.missions.claimMissionReward(missionId);
      setSuccessMsg(res.message || "Nagroda odebrana!");
      setTimeout(() => setSuccessMsg(""), 2500);
      if (onRewardClaimed) await onRewardClaimed();
      await fetchMissions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Nie udało się odebrać nagrody");
      setTimeout(() => setError(""), 3000);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <>
      <button
        className={`missions-toggle-btn${expanded ? " expanded" : ""}`}
        onClick={() => setExpanded((v) => !v)}
        title="Misje / Questy"
        style={{ position: "fixed", top: 90, right: 20, zIndex: 1000 }}
      >
        🗺️
      </button>
      {expanded && (
        <div className="missions-widget">
          <div className="missions-header">
            <span className="missions-icon">🗺️</span>
            <h3 className="missions-title">Misje / Questy</h3>
          </div>
          {loading ? (
            <div className="missions-loading">Ładowanie...</div>
          ) : error ? (
            <div className="missions-error">{error}</div>
          ) : (
            <div className="missions-list">
              {missions.length === 0 && <div>Brak dostępnych misji.</div>}
              {missions.map((m) => (
                <div key={m.MissionId} className={`mission-item${m.IsCompleted ? " completed" : ""}${m.IsClaimed ? " claimed" : ""}`}>
                  <div className="mission-main-row">
                    <div className="mission-name">{m.Name}</div>
                    <div className="mission-reward">🎁 {m.RewardAmount} PLN</div>
                  </div>
                  <div className="mission-desc">{m.Description}</div>
                  <div className="mission-progress-row">
                    <div className="mission-progress-bar">
                      <div
                        className="mission-progress-bar-inner"
                        style={{ width: `${Math.min(100, (m.CurrentProgress / m.RequiredAmount) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="mission-progress-label">
                      {m.CurrentProgress} / {m.RequiredAmount}
                    </div>
                  </div>
                  <div className="mission-actions">
                    {m.IsClaimed ? (
                      <span className="mission-claimed">Odebrano</span>
                    ) : m.IsCompleted ? (
                      <button
                        className="mission-claim-btn"
                        onClick={() => handleClaim(m.MissionId)}
                        disabled={claimingId === m.MissionId}
                      >
                        {claimingId === m.MissionId ? "Odbieranie..." : "Odbierz nagrodę"}
                      </button>
                    ) : (
                      <span className="mission-incomplete">W trakcie</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {successMsg && <div className="missions-success">{successMsg}</div>}
        </div>
      )}
    </>
  );
};

export default MissionsWidget;
