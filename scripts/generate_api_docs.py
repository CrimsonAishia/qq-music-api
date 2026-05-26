#!/usr/bin/env python3
"""
QQ Music API 接口测试 & 文档生成脚本

功能：
1. 逐个请求所有 API 接口
2. 记录请求参数和响应结果
3. 自动生成 Markdown 格式的 API 文档（含真实示例）
4. 输出测试摘要

用法：
  python scripts/generate_api_docs.py [--base-url http://localhost:3200] [--cookie "..."]

依赖：
  pip install requests
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import urlencode

import requests

# ============ 配置 ============

DEFAULT_BASE_URL = "http://localhost:3200"
OUTPUT_DIR = "test-results"
DOCS_OUTPUT = "docs/API_GENERATED.md"

# ============ 接口定义 ============

API_ENDPOINTS = [
    {
        "name": "关键词搜索（歌曲）",
        "method": "GET",
        "path": "/getSearchByKey/晴天/3/1",
        "params": {"t": 0},
        "category": "public",
        "group": "搜索",
        "desc": "根据关键词搜索歌曲，支持多种搜索类型（t: 0=歌曲, 2=专辑, 3=歌单, 7=歌词, 8=专辑v2, 9=歌手, 12=MV）",
    },
    {
        "name": "关键词搜索（歌单）",
        "method": "GET",
        "path": "/getSearchByKey/周杰伦/3",
        "params": {"t": 3},
        "category": "public",
        "group": "搜索",
        "desc": "搜索歌单（t=3）",
    },
    {
        "name": "搜索联想",
        "method": "GET",
        "path": "/getSmartbox/晴天",
        "params": {},
        "category": "public",
        "group": "搜索",
        "desc": "输入关键词时实时返回联想提示",
    },
    {
        "name": "热搜关键词",
        "method": "GET",
        "path": "/getHotkey",
        "params": {},
        "category": "public",
        "group": "搜索",
        "desc": "获取当前热搜关键词列表",
    },
    {
        "name": "歌曲详情",
        "method": "GET",
        "path": "/getSongInfo/0039MnYb0qxYhV",
        "params": {},
        "category": "public",
        "group": "歌曲",
        "desc": "获取歌曲详细信息",
    },
    {
        "name": "获取播放链接",
        "method": "GET",
        "path": "/getMusicPlay/0039MnYb0qxYhV",
        "params": {"quality": "128"},
        "category": "vip",
        "group": "歌曲",
        "desc": "获取歌曲播放 URL（服务端使用 VIP 账号）。quality: m4a/128/320/ape/flac",
    },
    {
        "name": "获取歌词",
        "method": "GET",
        "path": "/getLyric/0039MnYb0qxYhV",
        "params": {},
        "category": "vip",
        "group": "歌曲",
        "desc": "获取 LRC 格式歌词（服务端使用 VIP 账号）",
    },
    {
        "name": "歌单列表",
        "method": "GET",
        "path": "/getSongLists/0/5/10000000/5",
        "params": {},
        "category": "public",
        "group": "歌单",
        "desc": "获取歌单广场列表。路径参数: /page/limit/categoryId/sortId",
    },
    {
        "name": "歌单详情",
        "method": "GET",
        "path": "/getSongListDetail/7707261125",
        "params": {},
        "category": "public",
        "group": "歌单",
        "desc": "获取歌单完整信息。路径参数: /disstid",
    },
    {
        "name": "歌单分类标签",
        "method": "GET",
        "path": "/getSongListCategories",
        "params": {},
        "category": "public",
        "group": "歌单",
        "desc": "获取歌单分类标签树",
    },
    {
        "name": "排行榜列表",
        "method": "GET",
        "path": "/getTopLists",
        "params": {},
        "category": "public",
        "group": "排行榜",
        "desc": "获取所有排行榜概览",
    },
    {
        "name": "排行榜详情",
        "method": "GET",
        "path": "/getRanks/4/5/0",
        "params": {},
        "category": "public",
        "group": "排行榜",
        "desc": "获取指定排行榜歌曲列表。路径参数: /topId/limit/page",
    },
    {
        "name": "歌手列表",
        "method": "GET",
        "path": "/getSingerList/-100/-100/-100/-100/1",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手列表。路径参数: /area/sex/genre/index/page",
    },
    {
        "name": "歌手热歌",
        "method": "GET",
        "path": "/getSingerHotsong/0025NhlN2yWrP4/3/0",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手热门歌曲",
    },
    {
        "name": "歌手专辑",
        "method": "GET",
        "path": "/getSingerAlbum/0025NhlN2yWrP4/3/0",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手专辑列表",
    },
    {
        "name": "歌手MV",
        "method": "GET",
        "path": "/getSingerMv/0025NhlN2yWrP4/3/listen",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手 MV 列表。order: time=粉丝上传, listen=歌手全部",
    },
    {
        "name": "歌手简介",
        "method": "GET",
        "path": "/getSingerDesc/0025NhlN2yWrP4",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手简介信息",
    },
    {
        "name": "歌手粉丝数",
        "method": "GET",
        "path": "/getSingerStarNum/0025NhlN2yWrP4",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取歌手粉丝数量",
    },
    {
        "name": "相似歌手",
        "method": "GET",
        "path": "/getSimilarSinger/0025NhlN2yWrP4",
        "params": {},
        "category": "public",
        "group": "歌手",
        "desc": "获取相似歌手推荐",
    },
    {
        "name": "专辑详情",
        "method": "GET",
        "path": "/getAlbumInfo/000MkMni19ClKG",
        "params": {},
        "category": "public",
        "group": "专辑",
        "desc": "获取专辑详细信息",
    },
    {
        "name": "数字专辑列表",
        "method": "GET",
        "path": "/getDigitalAlbumLists",
        "params": {},
        "category": "public",
        "group": "专辑",
        "desc": "获取数字专辑列表",
    },
    {
        "name": "新碟列表",
        "method": "GET",
        "path": "/getNewDisks/1/5",
        "params": {},
        "category": "public",
        "group": "专辑",
        "desc": "获取新碟列表。路径参数: /page/limit",
    },
    {
        "name": "MV列表",
        "method": "GET",
        "path": "/getMv/15/7/3/0",
        "params": {},
        "category": "public",
        "group": "MV",
        "desc": "获取 MV 列表",
    },
    {
        "name": "MV标签列表",
        "method": "GET",
        "path": "/getMvByTag",
        "params": {},
        "category": "public",
        "group": "MV",
        "desc": "获取 MV 分类标签",
    },
    {
        "name": "MV播放链接",
        "method": "GET",
        "path": "/getMvPlay/w0026q7f01a",
        "params": {},
        "category": "vip",
        "group": "MV",
        "desc": "获取 MV 播放链接（服务端使用 VIP 账号）",
    },
    {
        "name": "电台列表",
        "method": "GET",
        "path": "/getRadioLists",
        "params": {},
        "category": "user",
        "group": "电台与推荐",
        "desc": "获取电台分类列表",
        "need_cookie": True,
    },
    {
        "name": "个性化推荐",
        "method": "GET",
        "path": "/getRecommend",
        "params": {},
        "category": "user",
        "group": "电台与推荐",
        "desc": "获取个性化推荐内容（歌单/新歌/排行榜等）",
        "need_cookie": True,
    },
    {
        "name": "评论列表",
        "method": "GET",
        "path": "/getComments/8220",
        "params": {},
        "category": "public",
        "group": "评论",
        "desc": "获取专辑/歌单评论列表",
    },
    {
        "name": "图片地址",
        "method": "GET",
        "path": "/getImageUrl",
        "params": {"id": "0025NhlN2yWrP4", "size": "300x300"},
        "category": "public",
        "group": "工具",
        "desc": "根据 MID 生成图片 CDN 地址",
    },
    {
        "name": "QQ音乐下载信息",
        "method": "GET",
        "path": "/downloadQQMusic",
        "params": {},
        "category": "vip",
        "group": "工具",
        "desc": "获取 QQ 音乐客户端下载信息",
    },
    {
        "name": "票务信息",
        "method": "GET",
        "path": "/getTicketInfo",
        "params": {},
        "category": "public",
        "group": "工具",
        "desc": "获取票务信息",
    },
]

# ============ 工具函数 ============


def truncate_json(obj: Any, max_items: int = 3, max_depth: int = 4, depth: int = 0) -> Any:
    """截断 JSON 对象，保留前 N 项，用于文档展示"""
    if depth >= max_depth:
        return "..." if isinstance(obj, (dict, list)) else obj

    if isinstance(obj, dict):
        result = {}
        for i, (k, v) in enumerate(obj.items()):
            if i >= max_items and len(obj) > max_items + 1:
                result["..."] = f"(共 {len(obj)} 个字段)"
                break
            result[k] = truncate_json(v, max_items, max_depth, depth + 1)
        return result

    if isinstance(obj, list):
        if len(obj) == 0:
            return []
        truncated = [truncate_json(item, max_items, max_depth, depth + 1) for item in obj[:max_items]]
        if len(obj) > max_items:
            truncated.append(f"... (共 {len(obj)} 项)")
        return truncated

    if isinstance(obj, str) and len(obj) > 200:
        return obj[:200] + "..."

    return obj


def build_url(base_url: str, path: str, params: dict) -> str:
    """构建完整请求 URL"""
    url = f"{base_url}{path}"
    if params:
        url += "?" + urlencode(params)
    return url


def make_request(
    base_url: str, endpoint: dict, cookie: Optional[str] = None
) -> dict:
    """发起请求并返回结果"""
    url = build_url(base_url, endpoint["path"], endpoint["params"])
    headers = {}
    if endpoint.get("need_cookie") and cookie:
        headers["X-User-Cookie"] = cookie

    start = time.time()
    try:
        if endpoint["method"] == "GET":
            resp = requests.get(url, headers=headers, timeout=15)
        else:
            resp = requests.post(url, headers=headers, json=endpoint.get("body"), timeout=15)

        duration_ms = int((time.time() - start) * 1000)
        body = None
        try:
            body = resp.json()
        except Exception:
            body = resp.text[:500]

        return {
            "success": True,
            "status": resp.status_code,
            "duration_ms": duration_ms,
            "body": body,
            "error": None,
        }
    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        return {
            "success": False,
            "status": 0,
            "duration_ms": duration_ms,
            "body": None,
            "error": str(e),
        }


# ============ 文档生成 ============


def generate_markdown(results: list[dict], base_url: str) -> str:
    """根据测试结果生成 Markdown 文档"""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"# QQ Music API 接口文档",
        f"",
        f"> 自动生成于 {now}  ",
        f"> 基础地址：`{base_url}`",
        f"",
        f"---",
        f"",
        f"## 统一响应格式",
        f"",
        f"所有接口返回统一的 JSON 结构：",
        f"",
        f"```json",
        f'{{',
        f'  "code": 0,         // 0=成功, 非0=失败',
        f'  "data": {{ ... }},   // 业务数据',
        f'  "message": ""      // 错误时的提示信息',
        f'}}',
        f"```",
        f"",
        f"---",
        f"",
    ]

    # 按 group 分组
    groups: dict[str, list[dict]] = {}
    for r in results:
        group = r["endpoint"]["group"]
        groups.setdefault(group, []).append(r)

    # 生成目录
    lines.append("## 目录\n")
    for group_name in groups:
        anchor = group_name.lower().replace(" ", "-")
        lines.append(f"- [{group_name}](#{anchor})")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 逐组生成
    for group_name, group_results in groups.items():
        lines.append(f"## {group_name}\n")

        for r in group_results:
            ep = r["endpoint"]
            resp = r["response"]
            lines.append(f"### {ep['name']}\n")
            lines.append(f"**{ep['desc']}**\n")

            # 认证标签
            cat_label = {"public": "🟢 公开", "vip": "🔑 VIP", "user": "👤 用户"}
            lines.append(f"认证：{cat_label.get(ep['category'], ep['category'])}\n")

            # 请求信息
            full_url = build_url(base_url, ep["path"], ep["params"])
            lines.append(f"**请求**\n")
            lines.append(f"```")
            lines.append(f"{ep['method']} {full_url}")
            lines.append(f"```\n")

            if ep["params"]:
                lines.append(f"| 参数 | 值 | 说明 |")
                lines.append(f"|------|-----|------|")
                for k, v in ep["params"].items():
                    lines.append(f"| {k} | `{v}` | |")
                lines.append("")

            # 响应信息
            if resp["success"]:
                status_icon = "✅" if resp["status"] == 200 else "⚠️"
                lines.append(
                    f"**响应** {status_icon} `{resp['status']}` ({resp['duration_ms']}ms)\n"
                )
                if resp["body"] is not None:
                    truncated = truncate_json(resp["body"])
                    json_str = json.dumps(truncated, ensure_ascii=False, indent=2)
                    lines.append(f"```json")
                    lines.append(json_str)
                    lines.append(f"```\n")
            else:
                lines.append(f"**响应** ❌ 请求失败\n")
                lines.append(f"```")
                lines.append(f"Error: {resp['error']}")
                lines.append(f"```\n")

            lines.append("---\n")

    # 认证分类汇总
    lines.append("## 接口认证分类\n")
    lines.append("| 类型 | 接口 | 说明 |")
    lines.append("|------|------|------|")

    public_apis = [r["endpoint"]["name"] for r in results if r["endpoint"]["category"] == "public"]
    vip_apis = [r["endpoint"]["name"] for r in results if r["endpoint"]["category"] == "vip"]
    user_apis = [r["endpoint"]["name"] for r in results if r["endpoint"]["category"] == "user"]

    lines.append(f"| 🟢 公开 | {', '.join(public_apis)} | 无需认证 |")
    lines.append(f"| 🔑 VIP | {', '.join(vip_apis)} | 服务端自动使用 VIP 账号 |")
    lines.append(f"| 👤 用户 | {', '.join(user_apis)} | 可选传入 X-User-Cookie |")
    lines.append("")

    return "\n".join(lines)


# ============ 主流程 ============


def main():
    parser = argparse.ArgumentParser(description="QQ Music API 测试 & 文档生成")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="API 基础地址")
    parser.add_argument("--cookie", default="", help="用户 Cookie（用于需要认证的接口）")
    parser.add_argument("--output", default=DOCS_OUTPUT, help="文档输出路径")
    parser.add_argument("--save-details", action="store_true", help="保存每个接口的详细响应")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    cookie = args.cookie

    # 尝试从配置文件读取 cookie
    if not cookie:
        cookie_file = os.path.join(os.path.dirname(__file__), "..", "config", "vip-user.json")
        if os.path.exists(cookie_file):
            try:
                with open(cookie_file, "r", encoding="utf-8") as f:
                    config = json.load(f)
                    cookie = config.get("cookie", "")
            except Exception:
                pass

    print(f"🎵 QQ Music API 测试 & 文档生成")
    print(f"   基础地址: {base_url}")
    print(f"   Cookie: {'已配置' if cookie else '未配置（用户接口可能受限）'}")
    print(f"   输出文件: {args.output}")
    print(f"{'=' * 60}")
    print()

    results = []
    total = len(API_ENDPOINTS)
    passed = 0
    failed = 0
    start_time = time.time()

    for i, endpoint in enumerate(API_ENDPOINTS, 1):
        name = endpoint["name"]
        cat_icon = {"public": "🟢", "vip": "🔑", "user": "👤"}.get(endpoint["category"], "")

        print(f"  [{i:2d}/{total}] {cat_icon} {name} ...", end=" ", flush=True)

        resp = make_request(base_url, endpoint, cookie)

        if resp["success"] and resp["status"] < 500:
            passed += 1
            status_str = f"✅ {resp['status']} ({resp['duration_ms']}ms)"
        else:
            failed += 1
            if resp["error"]:
                status_str = f"❌ {resp['error'][:50]}"
            else:
                status_str = f"⚠️  {resp['status']} ({resp['duration_ms']}ms)"

        print(status_str)

        results.append({"endpoint": endpoint, "response": resp})

    total_duration = int((time.time() - start_time) * 1000)

    print()
    print(f"{'=' * 60}")
    print(f"  📊 测试结果: {passed} 通过, {failed} 失败, 共 {total} 个接口")
    print(f"  ⏱️  总耗时: {total_duration}ms")
    print()

    # 保存详细结果
    if args.save_details:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S")
        details_dir = os.path.join(OUTPUT_DIR, f"details-{ts}")
        os.makedirs(details_dir, exist_ok=True)

        for r in results:
            ep = r["endpoint"]
            filename = f"{ep['path'].strip('/').replace('/', '-')}_{ep['name']}.json"
            filepath = os.path.join(details_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "meta": {
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "testName": ep["name"],
                            "category": ep["category"],
                            "passed": r["response"]["success"],
                            "durationMs": r["response"]["duration_ms"],
                        },
                        "request": {
                            "method": ep["method"],
                            "url": build_url(base_url, ep["path"], ep["params"]),
                            "params": ep["params"],
                        },
                        "response": r["response"]["body"],
                        "error": r["response"]["error"],
                    },
                    f,
                    ensure_ascii=False,
                    indent=2,
                )
        print(f"  💾 详细结果已保存到: {details_dir}")

    # 生成文档
    markdown = generate_markdown(results, base_url)
    output_path = args.output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(markdown)

    print(f"  📝 API 文档已生成: {output_path}")
    print()

    if failed > 0:
        print(f"  ⚠️  有 {failed} 个接口请求失败，请检查服务是否正常运行")
        sys.exit(1)


if __name__ == "__main__":
    main()
