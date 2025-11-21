"use client"

import { useState, useEffect, useRef } from "react"
import {
  Phone,
  X,
  Mic,
  ArrowRight,
  Activity,
  User,
  BookOpen,
  Sparkles,
  CloudRain,
  Settings,
  Bell,
  Shield,
  Check,
  Trash2,
  ChevronRight,
  Wind,
  Award,
  LayoutGrid,
  List,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"

// Types
type EmotionType = "anxiety" | "envy" | "fatigue" | "confusion" | "neutral"
type ActionType = "cognitive" | "micro_action"

interface Suggestion {
  title: string
  type: ActionType
  desc: string
  tag: string
}

interface HistoryItem {
  id: number
  trigger: string
  emotion: EmotionType
  suggestion: Suggestion
  date: string
  completed: boolean
  conversation: Array<{ role: "user" | "assistant"; content: string }>
}

interface Stats {
  total: number
  completed: number
  types: Record<string, number>
}

interface AppSettings {
  dailyCall: boolean
  privacy: boolean
}

// Audio Visualizer Component
const AudioVisualizer = ({ isActive, isListening = false }: { isActive: boolean; isListening?: boolean }) => {
  const colorClass = isListening ? "bg-rose-500" : "bg-teal-400"
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn("w-1 rounded-full transition-all duration-300", isActive ? "animate-pulse" : "h-1", colorClass)}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive ? (isListening ? "24px" : "16px") : "4px",
          }}
        />
      ))}
    </div>
  )
}

// Action Card Component
const ActionItemCard = ({
  item,
  onToggle,
  onView,
  onDelete,
  compact = false,
}: {
  item: HistoryItem
  onToggle: (id: number) => void
  onView: (item: HistoryItem) => void
  onDelete: (id: number) => void
  compact?: boolean
}) => {
  const isCompleted = item.completed
  const isCognitive = item.suggestion.type === "cognitive"

  return (
    <div
      onClick={() => onView(item)}
      className={cn(
        "relative bg-white rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group overflow-hidden",
        isCompleted
          ? "border-neutral-100 opacity-60 bg-neutral-50"
          : "border-neutral-100 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex justify-between items-start gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggle(item.id)
          }}
          className={cn(
            "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 z-10",
            isCompleted
              ? "bg-teal-500 border-teal-500 scale-110"
              : "border-neutral-300 group-hover:border-teal-400 bg-white",
          )}
        >
          {isCompleted && <Check size={14} className="text-white stroke-[3]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1 pr-6">
            <h4
              className={cn(
                "font-medium text-lg transition-all",
                isCompleted ? "text-neutral-400 line-through decoration-neutral-300" : "text-neutral-800",
              )}
            >
              {item.suggestion.title}
            </h4>
            <span
              className={cn(
                "text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold flex-shrink-0",
                isCompleted ? "bg-neutral-100 text-neutral-400" : "bg-neutral-50 text-neutral-500",
              )}
            >
              {!compact && new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {compact && (isCognitive ? "THOUGHT" : "ACTION")}
            </span>
          </div>

          <p
            className={cn(
              "text-xs mb-3 line-clamp-2 transition-all",
              isCompleted ? "text-neutral-300" : "text-neutral-400",
            )}
          >
            "{item.trigger}"
          </p>

          {!compact && (
            <div
              className={cn(
                "pt-3 border-t transition-colors flex justify-between items-center",
                isCompleted ? "border-neutral-200" : "border-neutral-50",
              )}
            >
              <div className="flex gap-2 items-center">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isCognitive ? "bg-blue-400" : "bg-teal-400",
                    isCompleted ? "opacity-50" : "",
                  )}
                ></span>
                <span className={cn("text-[10px]", isCompleted ? "text-neutral-300" : "text-neutral-400")}>
                  #{item.emotion}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors flex items-center gap-1",
                  isCompleted ? "text-teal-600/50" : "text-teal-600 opacity-0 group-hover:opacity-100",
                )}
              >
                查看详情 <ChevronRight size={12} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Collection Item Component
const CollectionItem = ({ item, onClick }: { item: HistoryItem; onClick: (item: HistoryItem) => void }) => {
  const isCognitive = item.suggestion.type === "cognitive"
  return (
    <div
      onClick={() => onClick(item)}
      className={cn(
        "aspect-[4/5] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1 group",
        isCognitive ? "bg-gradient-to-br from-blue-50 to-neutral-50" : "bg-gradient-to-br from-teal-50 to-neutral-50",
      )}
    >
      <div className="absolute -top-4 -right-4 p-3 opacity-5 transform rotate-12 group-hover:rotate-0 group-hover:opacity-10 transition-all duration-700">
        {isCognitive ? <CloudRain size={100} /> : <Sparkles size={100} />}
      </div>

      <div className="relative z-10">
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">
          {new Date(item.date).getDate()} {new Date(item.date).toLocaleString("en-US", { month: "short" })}
        </span>
        <h4 className="font-serif font-bold text-neutral-800 leading-snug line-clamp-3 text-sm">
          {item.suggestion.title}
        </h4>
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", isCognitive ? "bg-blue-400" : "bg-teal-400")}></div>
          <span className="text-[9px] text-neutral-500 uppercase tracking-wide">{item.emotion}</span>
        </div>
        {item.completed && (
          <div className="bg-teal-100 text-teal-700 p-1 rounded-full">
            <Check size={10} strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  )
}

// Space View Component
const SpaceView = ({
  onRequestCall,
  history,
  stats,
  onToggleAction,
  onViewEntry,
  onDeleteEntry,
}: {
  onRequestCall: () => void
  history: HistoryItem[]
  stats: Stats
  onToggleAction: (id: number) => void
  onViewEntry: (item: HistoryItem) => void
  onDeleteEntry: (id: number) => void
}) => {
  const [activeTab, setActiveTab] = useState<"timeline" | "collection">("timeline")

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 pt-12 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm border-b border-neutral-50">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-800">早安, 朋友</h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Stay mindful, stay present.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 overflow-hidden border-2 border-white shadow-sm"></div>
      </div>

      <div className="p-6 pb-2">
        <div className="bg-neutral-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-neutral-400 text-xs font-medium mb-1">WEEKLY RESONANCE</p>
              <h3 className="text-3xl font-serif">
                {stats.total} <span className="text-sm font-sans font-normal text-neutral-400">Echoes</span>
              </h3>
            </div>
            <div className="flex gap-1">
              {["anxiety", "envy", "fatigue", "confusion"].map((emo) => (
                <div key={emo} className="flex flex-col items-center gap-1">
                  <div className="w-1.5 bg-neutral-700 rounded-full overflow-hidden h-8 flex items-end">
                    <div
                      className="w-full bg-teal-500 rounded-full transition-all duration-1000"
                      style={{ height: `${Math.min((stats.types[emo] || 0) * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 group cursor-pointer" onClick={onRequestCall}>
          <div className="bg-white border border-teal-100 rounded-2xl p-1 shadow-sm group-hover:shadow-md transition-all">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 text-teal-900 transform translate-x-2 -translate-y-2">
                <MessageSquare size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-teal-900">开始AI对话</h3>
                <p className="text-teal-700/70 text-xs mt-1">Echo is ready to listen.</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles size={18} className="animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b border-neutral-100 mb-4">
          <button
            onClick={() => setActiveTab("timeline")}
            className={cn(
              "pb-3 text-sm font-medium transition-all relative flex items-center gap-2",
              activeTab === "timeline" ? "text-neutral-800" : "text-neutral-400",
            )}
          >
            <List size={14} /> Timeline
            {activeTab === "timeline" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-800 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("collection")}
            className={cn(
              "pb-3 text-sm font-medium transition-all relative flex items-center gap-2",
              activeTab === "collection" ? "text-neutral-800" : "text-neutral-400",
            )}
          >
            <LayoutGrid size={14} /> Collection
            {activeTab === "collection" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-800 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 pb-20 min-h-[200px]">
        {history.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <Wind className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              空间是空的。
              <br />
              等一个回响。
            </p>
          </div>
        ) : activeTab === "timeline" ? (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {history.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                onToggle={onToggleAction}
                onView={onViewEntry}
                onDelete={onDeleteEntry}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in-50 duration-500">
            {history.map((item) => (
              <CollectionItem key={item.id} item={item} onClick={onViewEntry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Journal View Component
const JournalView = ({
  history,
  onToggleAction,
  onViewEntry,
  onDeleteEntry,
}: {
  history: HistoryItem[]
  onToggleAction: (id: number) => void
  onViewEntry: (item: HistoryItem) => void
  onDeleteEntry: (id: number) => void
}) => {
  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long" })
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate()

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const entry = history.find((h) => new Date(h.date).getDate() === day)
    return { day, entry }
  })

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="p-6 pt-12 bg-white shadow-sm border-b border-neutral-50 sticky top-0 z-10">
        <h1 className="text-2xl font-serif font-bold text-neutral-800 mb-1">情绪日记</h1>
        <p className="text-xs text-neutral-400">
          {currentMonth} {currentYear}
        </p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-neutral-800">Mood Calendar</h3>
            <div className="flex gap-2 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>Done
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>Todo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center relative overflow-hidden group transition-all",
                  item.entry
                    ? "bg-white shadow-sm border border-neutral-100 cursor-pointer hover:border-teal-300"
                    : "bg-neutral-50",
                )}
                onClick={() => item.entry && onViewEntry(item.entry)}
              >
                {item.entry && (
                  <div
                    className={cn("absolute inset-0 opacity-20", item.entry.completed ? "bg-teal-400" : "bg-blue-400")}
                  ></div>
                )}
                {item.entry && item.entry.completed && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                )}
                <span
                  className={cn(
                    "relative z-10 text-xs",
                    item.entry ? "text-neutral-800 font-bold" : "text-neutral-300",
                  )}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-neutral-800 mb-4">All Entries</h3>
          <div className="space-y-6 relative border-l border-neutral-200 ml-3 pl-6 pb-20">
            {history.length === 0 ? (
              <div className="text-neutral-400 text-sm italic py-4">暂无记录</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative">
                  <div
                    className={cn(
                      "absolute -left-[29px] top-6 w-3 h-3 rounded-full border-2 border-white z-10",
                      item.completed
                        ? "bg-teal-500"
                        : item.suggestion.type === "cognitive"
                          ? "bg-blue-400"
                          : "bg-neutral-300",
                    )}
                  ></div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-400 font-mono mb-1">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <ActionItemCard
                      item={item}
                      onToggle={onToggleAction}
                      onView={onViewEntry}
                      onDelete={onDeleteEntry}
                      compact={true}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Me View Component
const MeView = ({
  stats,
  settings,
  onUpdateSettings,
  onClearData,
}: {
  stats: Stats
  settings: AppSettings
  onUpdateSettings: (key: keyof AppSettings, value: boolean) => void
  onClearData: () => void
}) => {
  const calculateLevel = (xp: number) => {
    if (xp < 5) return { level: 1, title: "觉察萌新" }
    if (xp < 15) return { level: 2, title: "觉察练习生" }
    if (xp < 30) return { level: 3, title: "情绪冲浪者" }
    return { level: 4, title: "内观大师" }
  }

  const userLevel = calculateLevel(stats.total)
  const nextLevelXP = [5, 15, 30, 100][userLevel.level - 1] || 100
  const progress = Math.min((stats.total / nextLevelXP) * 100, 100)

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="p-6 pt-12 bg-white shadow-sm border-b border-neutral-50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-neutral-800 mb-1">我的档案</h1>
            <p className="text-xs text-neutral-400">User ID: ECHO-{Math.floor(Math.random() * 9000) + 1000}</p>
          </div>
          <Settings className="text-neutral-400 hover:text-neutral-600 cursor-pointer" size={20} />
        </div>
      </div>

      <div className="p-6 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 overflow-hidden border-4 border-white shadow-lg"></div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-neutral-800">Echo User</h2>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded-full font-bold">
                Lv.{userLevel.level}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mb-2">{userLevel.title}</p>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-neutral-300 mt-1 text-right">
              {stats.total} / {nextLevelXP} XP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-1 text-neutral-400">
              <Activity size={14} /> <p className="text-xs">总觉察</p>
            </div>
            <p className="text-2xl font-serif text-neutral-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-1 text-neutral-400">
              <Award size={14} /> <p className="text-xs">已完成</p>
            </div>
            <p className="text-2xl font-serif text-teal-600">
              {stats.completed} <span className="text-sm text-neutral-400 font-sans">done</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm uppercase tracking-wider opacity-60">Preferences</h3>
          <div
            className="bg-white p-4 rounded-xl border border-neutral-100 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => onUpdateSettings("dailyCall", !settings.dailyCall)}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  settings.dailyCall ? "bg-teal-100 text-teal-600" : "bg-neutral-100 text-neutral-600",
                )}
              >
                <Bell size={16} />
              </div>
              <span className="text-sm font-medium text-neutral-700">每日随机来电</span>
            </div>
            <div
              className={cn(
                "w-10 h-5 rounded-full relative transition-colors",
                settings.dailyCall ? "bg-teal-500" : "bg-neutral-200",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all",
                  settings.dailyCall ? "right-1" : "left-1",
                )}
              ></div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-xl border border-neutral-100 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => onUpdateSettings("privacy", !settings.privacy)}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  settings.privacy ? "bg-teal-100 text-teal-600" : "bg-neutral-100 text-neutral-600",
                )}
              >
                <Shield size={16} />
              </div>
              <span className="text-sm font-medium text-neutral-700">隐私模糊模式</span>
            </div>
            <div
              className={cn(
                "w-10 h-5 rounded-full relative transition-colors",
                settings.privacy ? "bg-teal-500" : "bg-neutral-200",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all",
                  settings.privacy ? "right-1" : "left-1",
                )}
              ></div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-xl border border-neutral-100 flex items-center justify-between cursor-pointer hover:border-rose-200 group"
            onClick={() => {
              if (confirm("确定要清除所有历史记录吗？")) onClearData()
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-full text-rose-500 group-hover:bg-rose-100">
                <Trash2 size={16} />
              </div>
              <span className="text-sm font-medium text-neutral-700 group-hover:text-rose-600">清除所有数据</span>
            </div>
            <ChevronRight size={16} className="text-neutral-300 group-hover:text-rose-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Container
const Dashboard = ({
  onRequestCall,
  history,
  onToggleAction,
  onViewEntry,
  onDeleteEntry,
  settings,
  onUpdateSettings,
  onClearData,
}: {
  onRequestCall: () => void
  history: HistoryItem[]
  settings: AppSettings
  onToggleAction: (id: number) => void
  onViewEntry: (item: HistoryItem) => void
  onDeleteEntry: (id: number) => void
  onUpdateSettings: (key: keyof AppSettings, value: boolean) => void
  onClearData: () => void
}) => {
  const [currentView, setCurrentView] = useState<"space" | "journal" | "me">("space")

  const stats: Stats = {
    total: history.length,
    completed: history.filter((h) => h.completed).length,
    types: history.reduce(
      (acc, curr) => {
        if (curr.emotion) {
          acc[curr.emotion] = (acc[curr.emotion] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-neutral-50",
        settings.privacy ? "blur-[2px] hover:blur-0 transition-all duration-500" : "",
      )}
    >
      {currentView === "space" && (
        <SpaceView
          onRequestCall={onRequestCall}
          history={history}
          stats={stats}
          onToggleAction={onToggleAction}
          onViewEntry={onViewEntry}
          onDeleteEntry={onDeleteEntry}
        />
      )}
      {currentView === "journal" && (
        <JournalView
          history={history}
          onToggleAction={onToggleAction}
          onViewEntry={onViewEntry}
          onDeleteEntry={onDeleteEntry}
        />
      )}
      {currentView === "me" && (
        <MeView stats={stats} settings={settings} onUpdateSettings={onUpdateSettings} onClearData={onClearData} />
      )}

      <div className="bg-white/90 backdrop-blur border-t border-neutral-100 p-4 flex justify-around items-center absolute bottom-0 w-full z-20 pb-6">
        <button
          onClick={() => setCurrentView("space")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-300",
            currentView === "space" ? "text-neutral-800 scale-105" : "hover:text-neutral-600",
          )}
        >
          <Activity size={20} strokeWidth={currentView === "space" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Space</span>
        </button>
        <button
          onClick={() => setCurrentView("journal")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-300",
            currentView === "journal" ? "text-neutral-800 scale-105" : "hover:text-neutral-600",
          )}
        >
          <BookOpen size={20} strokeWidth={currentView === "journal" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Journal</span>
        </button>
        <button
          onClick={() => setCurrentView("me")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-300",
            currentView === "me" ? "text-neutral-800 scale-105" : "hover:text-neutral-600",
          )}
        >
          <User size={20} strokeWidth={currentView === "me" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Me</span>
        </button>
      </div>
    </div>
  )
}

// Incoming Call Component
const IncomingCall = ({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) => {
  return (
    <div className="fixed inset-0 bg-neutral-900 z-50 flex flex-col items-center justify-between py-20 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-neutral-900 to-blue-900/20"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="flex flex-col items-center mt-16 relative z-10">
        <div className="w-40 h-40 rounded-full bg-neutral-800/50 flex items-center justify-center mb-8 relative backdrop-blur-md border border-white/10">
          <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-ping"></div>
          <div className="absolute inset-4 rounded-full border border-teal-500/50 animate-ping delay-500"></div>
          <div className="w-24 h-24 rounded-full overflow-hidden opacity-80">
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="text-white" size={40} />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-serif tracking-wide mb-2">Echo AI</h2>
        <p className="text-neutral-400 flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          智能陪伴空间 · 来电中...
        </p>
      </div>
      <div className="w-full max-w-xs flex justify-between px-10 mb-16 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-rose-500/90 backdrop-blur flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20 active:scale-90"
          >
            <Phone className="w-7 h-7 text-white rotate-[135deg]" />
          </button>
          <span className="text-xs text-neutral-400 tracking-widest uppercase">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 backdrop-blur flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-teal-900/20 animate-bounce active:scale-90"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs text-neutral-400 tracking-widest uppercase">Accept</span>
        </div>
      </div>
    </div>
  )
}

// AI Chat Interface Component
const ChatInterface = ({
  onFinish,
}: {
  onFinish: (
    result: {
      trigger: string
      emotion: EmotionType
      suggestion: Suggestion
      conversation: Array<{ role: "user" | "assistant"; content: string }>
    } | null,
  ) => void
}) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setInput } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      // The analysis data will be in the data stream, handled by the useEffect below
    },
  })

  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Watch for data changes to trigger analysis view
  useEffect(() => {
    if (!data || data.length === 0) return

    const lastData = data[data.length - 1] as any
    if (lastData && lastData.shouldEnd && lastData.result) {
      // Add a small delay for natural transition
      setTimeout(() => {
        onFinish({
          trigger: messages.find((m) => m.role === "user")?.content || "Conversation",
          emotion: lastData.result.emotion,
          suggestion: lastData.result.suggestion,
          conversation: messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        })
      }, 1500)
    }
  }, [data, messages, onFinish])

  const handleMicClick = () => {
    if (isListening) return
    setIsListening(true)
    // Simulate voice input
    setTimeout(() => {
      setIsListening(false)
      const sampleTexts = [
        "我觉得最近压力好大，事情堆在一起...",
        "看到朋友圈大家都在晒旅行，突然觉得很羡慕...",
        "不知道为什么，今天特别不想动，很累...",
        "感觉工作没有什么意义，不知道该不该换...",
        "有点担心下周的汇报，怕讲不好...",
      ]
      setInput(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
    }, 2000)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, isListening])

  return (
    <div className="flex flex-col h-full bg-neutral-50 relative">
      <div className="bg-white/90 backdrop-blur-md p-4 shadow-sm flex items-center justify-between z-10 sticky top-0 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center border border-teal-200">
            <Sparkles className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-medium text-neutral-800 text-sm">Echo AI</h3>
            <div className="flex items-center gap-2">
              <AudioVisualizer isActive={isLoading || messages.length > 0 || isListening} isListening={isListening} />
              <span className={cn("text-xs", isListening ? "text-rose-500 font-bold animate-pulse" : "text-teal-600")}>
                {isListening ? "正在聆听..." : "通话中"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onFinish(null)}
          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-white text-neutral-700 border border-neutral-200 p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
              嗨，我是Echo。最近有什么触动你的瞬间吗？可以是一句话、一个画面，或者只是一种感觉。
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                msg.role === "user"
                  ? "bg-gradient-to-br from-teal-600 to-blue-600 text-white rounded-tr-sm"
                  : "bg-white text-neutral-700 border border-neutral-200 rounded-tl-sm",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
        {isListening && (
          <div className="flex justify-end animate-pulse">
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl rounded-tr-sm flex gap-2 items-center shadow-sm">
              <Mic size={14} className="text-rose-500" />
              <span className="text-rose-400 text-xs">正在录音...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-neutral-100 pb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
          className="flex gap-3 items-center"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className={cn(
              "p-3 rounded-full transition-all",
              isListening
                ? "bg-rose-100 text-rose-500 scale-110"
                : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100",
            )}
          >
            <Mic size={20} className={isListening ? "animate-bounce" : ""} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isListening ? "聆听中..." : "说点什么..."}
              disabled={isListening || isLoading}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-full px-5 py-3 text-sm transition-all outline-none disabled:bg-neutral-100"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-full transition-all shadow-sm",
              input.trim() && !isLoading
                ? "bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-teal-200 transform hover:scale-105"
                : "bg-neutral-200 text-neutral-400",
            )}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

// Resonance Card Component
const ResonanceCard = ({
  data,
  onClose,
  isViewMode,
}: { data: HistoryItem | null; onClose: () => void; isViewMode: boolean }) => {
  if (!data) return null
  const emotionLabels: Record<string, string> = {
    anxiety: "焦虑 / Anxiety",
    envy: "渴望 / Envy",
    fatigue: "疲惫 / Fatigue",
    confusion: "迷茫 / Confusion",
    neutral: "触动 / Touch",
  }
  return (
    <div className="fixed inset-0 z-50 h-full bg-neutral-900/60 backdrop-blur-sm p-6 flex flex-col items-center justify-center overflow-y-auto">
      <div className="bg-[#fffdf5] w-full max-w-sm rounded-none shadow-2xl overflow-hidden relative border-8 border-white animate-in zoom-in-95 duration-500">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-teal-800/20 rotate-[-2deg] backdrop-blur-sm z-10"></div>
        <div className="p-8 pb-4 text-center border-b border-neutral-100 border-dashed">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-4">
            {data.suggestion.type === "cognitive" ? (
              <CloudRain size={20} className="text-neutral-500" />
            ) : (
              <Sparkles size={20} className="text-teal-600" />
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-neutral-800">Resonance Receipt</h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] mt-1">
            No. {Math.floor(Math.random() * 10000)}
          </p>
        </div>
        <div className="p-8 space-y-8">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">01 · The Trigger</p>
            <p className="text-neutral-700 italic font-serif text-lg leading-relaxed">"{data.trigger}"</p>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] px-2 py-1 bg-neutral-100 text-neutral-500 rounded-full uppercase">
                {emotionLabels[data.emotion] || emotionLabels.neutral}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "rounded-xl p-5 border",
              data.suggestion.type === "cognitive" ? "bg-blue-50/50 border-blue-100" : "bg-teal-50/50 border-teal-100",
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                {data.suggestion.type === "cognitive" ? "02 · Cognitive Shift" : "02 · Micro Action"}
              </p>
              <span className="text-[10px] px-2 py-0.5 bg-white rounded border text-neutral-500 shadow-sm">
                {data.suggestion.tag}
              </span>
            </div>
            <h3 className="font-bold text-neutral-800 mb-2 text-lg">{data.suggestion.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{data.suggestion.desc}</p>
          </div>
          <div className="text-center border-t border-neutral-100 border-dashed pt-6">
            <p className="text-neutral-400 text-xs font-serif italic">
              "Not every thought needs to be heavy.
              <br />
              Sometimes, just let it echo."
            </p>
            <p className="text-[10px] text-neutral-300 font-mono mt-4 uppercase">
              {new Date().toLocaleDateString()} • EchoSpace
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col w-full max-w-sm gap-3">
        {isViewMode ? (
          <Button onClick={onClose} variant="secondary" className="w-full shadow-xl">
            关闭小票
          </Button>
        ) : (
          <>
            <Button
              onClick={onClose}
              className="w-full shadow-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            >
              收下这张小票
            </Button>
            <button onClick={onClose} className="text-white text-sm hover:text-teal-200 py-2">
              丢弃
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Onboarding Component
const Onboarding = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-teal-50/30 to-blue-50/30 p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>
      <div className="z-10 flex flex-col items-center">
        <div
          className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center mb-8 relative group cursor-pointer transition-transform hover:scale-105 shadow-xl"
          onClick={onStart}
        >
          <div className="absolute w-full h-full bg-teal-400 rounded-full animate-ping opacity-20"></div>
          <Sparkles className="w-10 h-10 text-white relative z-10" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-neutral-800 mb-4 tracking-wide">回响 · Echo</h1>
        <p className="text-neutral-600 mb-12 leading-relaxed max-w-xs mx-auto text-sm">
          把碎片化的情绪，
          <br />
          变成一个被看见的瞬间。
          <br />
          <br />
          AI陪你对话，
          <br />
          让每个感受都有回响。
        </p>
        <Button
          onClick={onStart}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg"
        >
          进入空间
        </Button>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const [appState, setAppState] = useState<"onboarding" | "dashboard" | "calling" | "chatting" | "result">("onboarding")

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("echo_history")
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  })

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") return { dailyCall: true, privacy: false }
    try {
      const saved = localStorage.getItem("echo_settings")
      const parsed = saved ? JSON.parse(saved) : null
      return parsed || { dailyCall: true, privacy: false }
    } catch (e) {
      return { dailyCall: true, privacy: false }
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("echo_history", JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("echo_settings", JSON.stringify(settings))
    }
  }, [settings])

  const [currentResult, setCurrentResult] = useState<HistoryItem | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const startApp = () => setAppState("dashboard")

  const requestCall = () => {
    setTimeout(() => setAppState("calling"), 600)
  }

  const acceptCall = () => setAppState("chatting")

  const declineCall = () => setAppState("dashboard")

  const finishChat = (
    resultData: {
      trigger: string
      emotion: EmotionType
      suggestion: Suggestion
      conversation: Array<{ role: "user" | "assistant"; content: string }>
    } | null,
  ) => {
    if (resultData) {
      const newHistoryItem: HistoryItem = {
        ...resultData,
        id: Date.now(),
        date: new Date().toISOString(),
        completed: false,
      }
      setCurrentResult(newHistoryItem)
      setIsViewMode(false)
      setAppState("result")
      setHistory((prev) => [newHistoryItem, ...prev])
    } else {
      setAppState("dashboard")
    }
  }

  const toggleActionStatus = (id: number) => {
    setHistory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, completed: !item.completed }
        }
        return item
      }),
    )
  }

  const deleteEntry = (id: number) => {
    if (confirm("确定要移除这条记录吗？")) {
      setHistory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const viewEntry = (item: HistoryItem) => {
    setCurrentResult(item)
    setIsViewMode(true)
    setAppState("result")
  }

  const closeResult = () => {
    setAppState("dashboard")
    setCurrentResult(null)
    setIsViewMode(false)
  }

  const updateSettings = (key: keyof AppSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const clearData = () => {
    setHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("echo_history")
    }
  }

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-neutral-50 shadow-2xl overflow-hidden font-sans text-neutral-800 relative">
      {appState === "onboarding" && <Onboarding onStart={startApp} />}

      {appState === "dashboard" && (
        <Dashboard
          onRequestCall={requestCall}
          history={history}
          settings={settings}
          onToggleAction={toggleActionStatus}
          onViewEntry={viewEntry}
          onDeleteEntry={deleteEntry}
          onUpdateSettings={updateSettings}
          onClearData={clearData}
        />
      )}

      {appState === "calling" && <IncomingCall onAccept={acceptCall} onDecline={declineCall} />}

      {appState === "chatting" && <ChatInterface onFinish={finishChat} />}

      {appState === "result" && <ResonanceCard data={currentResult} onClose={closeResult} isViewMode={isViewMode} />}
    </div>
  )
}
