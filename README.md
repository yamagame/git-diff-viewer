# git-diff-viewer

## Demo

[https://yamagame.github.io/git-diff-viewer](https://yamagame.github.io/git-diff-viewer)

## Git Diff

### 比較の基本

```bash
git diff <path(old)> <path(new)>
```

一つ目のパスをソース、二つ目のパスをターゲットとして比較する。\<path> にはディレクトリを指定することもできる。

リダイレクトを使って比較ファイル(.diff)を作成するとコピペが楽

```bash
git diff <path(old)> <path(new)>  > .diff
```

### リポジトリ外を比較する場合

```bash
git diff --no-index <path(old)> <path(new)>
```

### ブランチ間で比較

```bash
# ブランチの一覧
git branch
```

```bash
# 比較例
git diff topic:<path(old)> master:<path(new)>
```

### タグ間で比較

```bash
# タグの一覧
git tag
```

```bash
# 比較例
git diff v1.0.0:<path(old)> v2.0.0:<path(new)>
```

### コミット間で比較

```bash
# コミット履歴の一覧
git log --oneline
```

```bash
# 比較例
git diff 9802941f:<path(old)> 428ddb68:<path(new)>
```

### リモート名（例:origin）をつけて比較

```bash
git diff origin/topic:<path(old)> origin/master:<path(new)>
```

## License

MIT
