# Windows Watchpack 錯誤說明

開發時若看到：

```
Watchpack Error (initial scan): Error: EINVAL: invalid argument, lstat 'C:\DumpStack.log.tmp'
Watchpack Error (initial scan): Error: EINVAL: invalid argument, lstat 'C:\pagefile.sys'
...
```

- **原因**：Next.js 使用的 watchpack 在掃描時會碰到 C 槽系統檔，Windows 對這些檔案的 `lstat` 可能回傳 EINVAL。
- **現有緩解**：`next.config.ts` 的 `webpack.watchOptions.ignored` 已加入 `C:\\DumpStack.log.tmp`、`pagefile.sys`、`hiberfil.sys`、`swapfile.sys`，可減少掃描範圍。
- **若仍出現**：不影響 build 與運行；可改用 WSL 或將專案放在非系統碟（如 D:）以減少掃描到系統根目錄的機率。
