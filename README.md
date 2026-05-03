# Touchstone Tools

Touchstone ファイルをブラウザ上で扱うツール集です。

**https://jyomu.github.io/Touchstone-Tools/**

すべての処理はブラウザ内で完結します。ファイルはサーバーに送信されません。

---

## ツール一覧

### Touchstone Converter

Touchstone ファイルのフォーマット変換ツールです。

- 変換形式：**DB**（dB/angle）・**MA**（magnitude/angle）・**RI**（real/imaginary）
- 複数ファイルを一括変換し、ZIP でダウンロード
- 1〜9 ポートの `.sNp` ファイルに対応

### Touchstone CSV Extractor

Touchstone ファイルから S パラメータを CSV として書き出すツールです。

- チャンネル（Sij）を個別に選択して CSV 出力
- グラフプレビュー機能付き
- ZIP でまとめてダウンロード
- 1〜9 ポートの `.sNp` ファイルに対応

---

## 技術仕様

- 純粋な HTML + JavaScript（依存ライブラリなし）
- ZIP 生成もブラウザ内で完結（外部 API 不使用）
- GitHub Pages でそのままホスト可能
