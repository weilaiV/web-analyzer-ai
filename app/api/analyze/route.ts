import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

// 强制使用 Node.js 运行时以支持 cheerio
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url, apiKey, baseUrl, model } = await req.json();

    if (!url) return NextResponse.json({ error: '请输入有效的网址' }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: '请在设置中填入 API Key' }, { status: 401 });

    // 1. 抓取网页
    console.log(`正在抓取: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`无法访问该网站，状态码: ${response.status}`);
    const html = await response.text();

    // 2. 清洗数据
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg, header, footer, nav, link').remove();
    const title = $('title').text().trim() || '无标题';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000); // 截取前8000字符

    // 3. AI 分析
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl || "https://api.openai.com/v1",
    });

    const prompt = `
    你是一个网页分析师。请分析以下内容并返回 JSON。
    
    页面标题: ${title}
    正文片段: ${bodyText}

    任务：
    1. 生成200字以内中文摘要 (summary)
    2. 提取5-8个关键词 (keywords)
    3. 评价SEO质量 (seo_analysis)
    4. 如果有表格数据请转为Markdown表格，否则填"无" (structured_data)
    
    请严格只返回 JSON 格式: {"summary": "...", "keywords": [], "seo_analysis": "...", "structured_data": "...", "page_title": "..."}
    `;

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      // 修改后的代码：
      model: model || 'ep-20251203202708-4hm4c', 
    });

    const aiResult = JSON.parse(chatCompletion.choices[0].message.content || '{}');

    return NextResponse.json({ success: true, data: aiResult });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || '服务器内部错误' }, { status: 500 });
  }
}