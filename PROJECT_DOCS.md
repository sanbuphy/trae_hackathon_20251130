# SparkAI - Hackathon Assistant & Startup Idea Generator

## 1. 项目简介
SparkAI 是一个专为黑客松参与者和创业者打造的智能助手。它采用对话式交互，帮助用户从一个简单的点子或痛点出发，通过 AI 自动发散思维，提供多个创业方向或黑客松 Idea。用户选择方向后，系统将生成详细的项目文档。
项目风格融合了极客精神与顶级创投（如真格基金）的专业感，旨在激发创造力并提供切实可行的执行方案。

## 2. 核心功能
*   **极简入口 (Landing Page)**: 
    *   沉浸式体验，核心是一个 "Start" 按钮。
    *   Slogan: "今天你想创造什么？"
*   **智能发散 (Idea Generation)**:
    *   用户输入点子/痛点。
    *   AI 分析并提供 3-5 个不同维度的发展方向（每个方向有独特命名）。
*   **深度文档生成 (Project Documentation)**:
    *   用户选择方向后，生成包含产品定义、核心功能、技术栈推荐、商业模式分析的项目文档。
*   **搜索增强 (Search Enhancement)**:
    *   集成秘塔 AI (Metaso) 搜索能力。
    *   提供开关/按钮，激活后 AI 将结合实时网络信息（研报、市场动态）进行分析。

## 3. 技术栈
*   **Frontend Framework**: React 19 (via Vite)
*   **Language**: TypeScript
*   **UI Components**: shadcn/ui (based on Radix UI & Tailwind CSS)
*   **Styling**: Tailwind CSS (Dark Mode default)
*   **State Management**: React Hooks
*   **Routing**: React Router (if needed, initially single view or conditional rendering)
*   **Build Tool**: Vite

## 4. 系统架构与配置
*   **Environment Variables**:
    *   配置在 `.env` 文件中。
    *   `VITE_METASO_API_KEY`: 秘塔 AI 搜索接口密钥（预留）。
    *   `VITE_API_BASE_URL`: 后端 API 地址（如果分离）。
*   **Network**:
    *   默认监听端口: `8080`。

## 5. API 接口设计 (预留)

### 5.1 Generate Ideas
*   **Endpoint**: `/api/generate-ideas`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "input": "用户输入的点子或痛点",
      "enableSearch": true
    }
    ```
*   **Response**:
    ```json
    {
      "ideas": [
        {
          "id": "1",
          "title": "方向名称 (e.g., 'AI-Driven Legal Assistant')",
          "description": "简短描述..."
        },
        ...
      ]
    }
    ```

### 5.2 Generate Project Doc
*   **Endpoint**: `/api/generate-doc`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "ideaId": "1",
      "context": "原始输入"
    }
    ```
*   **Response**:
    ```json
    {
      "markdown": "# Project Title\n\n## Overview\n..."
    }
    ```

## 6. 设计风格指南 (Style Guide)
*   **Theme**: Dark Mode (Geek & VC Professional).
*   **Colors**:
    *   Background: Deep Black / Dark Gray (`#0a0a0a`).
    *   Foreground: Off-white / Silver (`#ededed`).
    *   Accent: Neon Green or Electric Blue (Tech vibes) or Gold (VC vibes).
*   **Typography**:
    *   Headings: Sans-serif, bold, clean (Inter / SF Pro).
    *   Code/Data: Monospace (JetBrains Mono / Fira Code).

## 7. 快速开始
1.  Install dependencies: `npm install`
2.  Start development server: `npm run dev` (Runs on port 8080)
3.  Build for production: `npm run build`
