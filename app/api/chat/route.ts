import { streamText, convertToCoreMessages, StreamData } from "ai"
import { groq } from "@ai-sdk/groq"

export const maxDuration = 30

const EMOTION_KEYWORDS = {
  anxiety: ["担心", "怕", "焦虑", "做不完", "来不及", "很难", "失败", "压力", "烦", "慌", "紧张"],
  envy: ["羡慕", "嫉妒", "他有", "凭什么", "差距", "别人", "好强", "优秀", "落后"],
  fatigue: ["累", "不想动", "没意思", "无聊", "消耗", "困", "睡觉", "躺", "内耗", "不想", "疲惫"],
  confusion: ["迷茫", "不知道", "方向", "意义", "为什么", "乱", "空", "茫然"],
}

const ACTION_LIBRARY = {
  anxiety: [
    {
      title: "极简原型实验",
      type: "micro_action",
      desc: "不用做完整个方案。只在纸上画出核心草图，并在旁边写下1个你最想解决的问题。",
      tag: "对抗完美主义",
    },
    {
      title: "最坏清单",
      type: "cognitive",
      desc: '写下你担心的3个最坏结果，然后针对每一个问自己："如果发生了，我能怎么应对？"',
      tag: "认知重构",
    },
    {
      title: "2分钟原则",
      type: "micro_action",
      desc: "如果这件事能在2分钟内做完，现在立刻就做，不要放进清单里。",
      tag: "即刻行动",
    },
  ],
  envy: [
    {
      title: "转化嫉妒",
      type: "cognitive",
      desc: '把你羡慕的那个人，想象成你的"未来替身"。告诉自己："他提前帮我验证了这条路是可行的。"',
      tag: "思维转换",
    },
    {
      title: "模仿一步",
      type: "micro_action",
      desc: "找出他做的一件小事（比如早起、读书、一种说话方式），今天就试着模仿一次。",
      tag: "行动跟随",
    },
    { title: "感恩日记", type: "cognitive", desc: "写下3件你已经拥有、且别人可能也羡慕你的事情。", tag: "关注自我" },
  ],
  fatigue: [
    {
      title: "5分钟离线",
      type: "micro_action",
      desc: "设置5分钟倒计时。期间不看手机，不说话，只闭眼听周围的声音。",
      tag: "精力恢复",
    },
    {
      title: "允许无为",
      type: "cognitive",
      desc: '对自己说一遍："今天我已经尽力了，剩下的事情交给明天的我。"然后心安理得地休息。',
      tag: "自我接纳",
    },
    {
      title: "洗个热水澡",
      type: "micro_action",
      desc: "在洗澡的时候，想象水流带走了所有的疲惫和压力。",
      tag: "感官疗愈",
    },
  ],
  confusion: [
    {
      title: "直觉筛选",
      type: "micro_action",
      desc: "拿出硬币，为纠结的选项抛一次。在硬币落地前的那一秒，你心里希望它是哪一面？那个就是答案。",
      tag: "直觉唤醒",
    },
    {
      title: "最小下一步",
      type: "micro_action",
      desc: "不管大目标。只写下明天早上醒来后，必须要做的第一件事。越小越好。",
      tag: "启动行动",
    },
    {
      title: "人生画布",
      type: "micro_action",
      desc: "拿出一张白纸，画出你理想中5年后的生活场景，不要用文字，只用火柴人画。",
      tag: "视觉化",
    },
  ],
  neutral: [
    {
      title: "情绪命名",
      type: "cognitive",
      desc: "给这个感觉起个名字，用一个词或短语。有时候光是命名这个动作，就能让它变得不那么强烈。",
      tag: "觉察练习",
    },
    {
      title: "深呼吸三次",
      type: "micro_action",
      desc: "闭上眼睛，用鼻子吸气数到4，屏息数到4，用嘴呼气数到6。重复三次。",
      tag: "身心调节",
    },
  ],
}

export async function POST(req: Request) {
  try {
    const { messages = [] } = await req.json()

    const conversationLength = messages.length
    const shouldEnd = conversationLength >= 6 // End after 6 messages (3 rounds)

    const systemPrompt = `你是Echo，一位温暖、专业的情绪陪伴者。你的目标是通过3-4轮对话，帮助用户深入探索情绪触发点。

对话策略：
- 第1-2轮：温柔地倾听并提出开放性问题，让用户展开描述情绪和具体情境
- 第3-4轮：深入挖掘触发因素，帮助用户看到情绪背后的原因
- 第5-6轮：温柔总结并准备结束对话

对话风格：
- 用简短、温暖的语言（30-50字）
- 多用开放性问题引导用户思考
- 展现共情和理解
- 不评判、不说教
- 自然口语化，像朋友一样

例子：
"我听到了。能再多说说吗？是什么让你有这种感觉？"
"当这种情况发生时，你通常会怎么做？"
"你觉得这背后最核心的原因是什么？"`

    const coreMessages = convertToCoreMessages(messages)
    const data = new StreamData()

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 150,
      temperature: 0.7,
      abortSignal: req.signal,
      onFinish: ({ text }) => {
        if (shouldEnd) {
          // Extract full conversation for analysis
          const fullConversation = messages.map((m: any) => m.content).join(" ") + " " + text

          // Detect emotion
          let detectedEmotion: keyof typeof ACTION_LIBRARY = "neutral"
          for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
            if (keywords.some((k) => fullConversation.includes(k))) {
              detectedEmotion = emotion as keyof typeof ACTION_LIBRARY
              break
            }
          }

          // Select random suggestion from detected emotion
          const actions = ACTION_LIBRARY[detectedEmotion]
          const selectedAction = actions[Math.floor(Math.random() * actions.length)]

          // Append analysis data
          data.append({
            shouldEnd: true,
            result: {
              emotion: detectedEmotion,
              suggestion: selectedAction,
            },
          })
        }
        data.close()
      },
    })

    return result.toDataStreamResponse({ data })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
