# Space Shooter & Card Matching アプリ

## 1. 概要

Space Arcadeは、タイトル画面から2種類のゲームを選んで遊べるブラウザー向けアーケードゲーム集です。

- **Space Shooter**：宇宙船を操作して敵を倒し、ステージクリアを目指すシューティングゲームです。スコアやクリア済みステージを記録します。
- **Card Matching**：カードをめくって同じ絵柄のペアを揃えるゲームです。EASY・NORMAL・HARDの難易度、制限時間、ヒント、スコア記録があります。

タイトル画面は日本語・英語・ミャンマー語に対応しています。ゲーム画面はタイトルページ内に埋め込んで表示されます。

## 2. 開発環境と技術スタック

| 項目 | 内容 |
| --- | --- |
| 実行環境 | HTMLファイルを表示できる最新のWebブラウザー |
| 言語・基本技術 | HTML5、CSS3、JavaScript（バニラJavaScript） |
| 描画・音声 | Canvas API、Web Audio API |
| 画面構成 | iframe、postMessage |
| 記録の保存 | localStorage（言語設定、スコア、クリア状況など） |
| 外部ライブラリ・素材 | Tailwind CSS、Font Awesome、Canvas Confetti、Google FontsをCDNから読み込み |

Node.jsやパッケージマネージャー、ビルド工程はありません。CDNから読み込むライブラリやフォントを利用するため、インターネット接続が必要です。サウンドはブラウザーの制限により、画面をクリックまたはタップした後に再生されます。

JavaScriptは通常のscriptタグで読み込む構成です。読み込み順を変更する場合は各HTMLのscriptタグの順を保ち、Space Shooterではstorage.jsを先に読み込んでください。

## 3. ディレクトリ構造

~~~text
space-arcade/
├── index.html                    # タイトル画面、ゲーム選択画面
├── css/                          # タイトル画面のスタイル
├── js/                           # タイトル画面、言語切り替え、メニューなど
├── games/
│   ├── space-shooter/
│   │   ├── index.html
│   │   ├── css/                  # シューティングゲームのスタイル
│   │   ├── js/                   # ゲーム進行、描画、敵、ステージなど
│   │   └── assets/
│   │       └── boss_ship.webp
│   └── card-matching/
│       ├── index.html
│       ├── css/                  # カードゲームとイントロのスタイル
│       ├── js/                   # ゲーム進行、効果音、イントロなど
│       └── assets/
│           └── card_back.webp
└── README.md
~~~

各ゲームは個別のindex.htmlを持ち、タイトル画面からiframe内に読み込まれます。ゲーム内の「タイトルへ」操作はpostMessageでタイトル画面に戻ります。

## 4. 起動手順

### ブラウザーで直接開く

1. space-arcade.zipを任意の場所に展開します。
2. 展開したspace-arcadeフォルダーを開きます。
3. ルートにあるindex.htmlをブラウザーで開きます。
4. 「ゲームスタート」を選び、遊ぶゲームをクリックまたはタップします。

## (GitのURL)
https://github.com/cn25304031-dotcom/terafes-06.git