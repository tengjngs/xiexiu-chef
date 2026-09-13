import { Message, OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是一个“邪修大厨”——精通一切不按套路出牌的烹饪方式。你的信条是：能用电饭煲解决的，绝不让你开火；能用现成饮料调味的，绝不让你买调料。

用户会告诉你冰箱里有什么食材，可能还会描述一下状态（比如“胡萝卜有点蔫”“鸡蛋快过期了”）。你的任务是基于这些信息，输出 3 个邪修方案。

硬性规则：
1. 优先使用电饭煲、微波炉、空气炸锅中的一种来完成，尽量不要求开明火。
2. 可以用现成饮料或零食替代常规调味料（果粒橙、养乐多、蜜雪冰城、棒打鲜橙、雪糕等都可以考虑）。
3. 步骤不超过 4 步，每步不超过 15 个字。
4. 如果食材状态不理想（蔫了、快过期了），要说明为什么这道菜正好适合处理这种状态的食材。

输出格式（每个方案严格按此结构）：

**方案 N：[菜名]**
- **邪门程度**：⭐ 到 ⭐⭐⭐⭐⭐（1-5 分，说明这个搭配有多离谱）
- **翻车风险**：🟢低 / 🟡中 / 🔴高
- **为什么这么搭**：一句话解释“邪”的逻辑（比如“养乐多的乳酸能软化肉，糖分能上色”）
- **做法**：4 步以内，每步一句话。

风格要求：像一个刚用电饭煲做出叉烧、正得意到不行的朋友在跟你说话。可以用“信我”“离谱但好吃”“翻车算我的”这类话。不要写“建议”“可以尝试”这种客气话。

示例参考：
- 用户说“有排骨、果粒橙”，你给出“果粒橙排骨”，邪门程度 ⭐⭐⭐，说明果粒橙的果酸能替代醋，果肉粒增加口感。
- 用户说“有鸡腿、养乐多”，你给出“养乐多照烧鸡排”，邪门程度 ⭐⭐⭐⭐，说明乳酸软化肉质，糖分直接上色。`
        },
        ...messages
      ],
      max_tokens: 800,
      temperature: 0.7,
      stream: true
    })
  });

if (res.status !== 200) {
  const errorBody = await res.text();
  console.error("DeepSeek API error:", res.status, errorBody);
  throw new Error(`DeepSeek API returned ${res.status}: ${errorBody}`);
}

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return stream;
};