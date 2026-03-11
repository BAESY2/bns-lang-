# BNS Lang 배포 가이드

## GitHub 레포 생성 및 푸시

```bash
# 프로젝트 루트에서
git init
git add .
git commit -m "feat: BNS Lang v2.0"

gh repo create bns-lang --public --description "Write PLC ladder logic with just a numpad. IEC 61131-3 DSL + MCP for Cursor." --source=. --push

# 토픽 태그 (검색 노출)
gh repo edit --add-topic plc,ladder-logic,iec-61131-3,dsl,mcp,cursor,ai-coding
```

## npm 배포

```bash
npm login
npm publish --access public
```

## GitHub Release

```bash
git tag v2.0.0
git push origin v2.0.0
gh release create v2.0.0 --title "v2.0.0 — Initial Public Release" --notes "BNS Lang: numpad DSL → IEC 61131-3. Cursor Rules + MCP (bns_compile, bns_check, bns_ladder, bns_explain)."
```

## 압축에서 복원 후 배포 (다른 머신에서)

```bash
tar xzf bns-lang-github.tar.gz
cd bns-lang   # 또는 압축 해제된 폴더명
# src/ 에 실제 BNS Lang 소스가 있는지 확인
git init && git add . && git commit -m "feat: BNS Lang v2.0"
gh repo create bns-lang --public --source=. --push
gh repo edit --add-topic plc,ladder-logic,iec-61131-3,dsl,mcp,cursor,ai-coding
```
