#!/bin/zsh
# 取得(1 店ずつ)と執筆(同時 4)を重ねて回し、最後に検査と組み込みをする。
# 使い方: zsh automation/v2/run-all.sh 80
cd "$(dirname "$0")/../.." || exit 1
FROM=${1:-80}
rm -f automation/v2/work/.prepare-done
node automation/v2/write-parallel.mjs --concurrency 4 --watch &
WP=$!
node automation/v2/write.mjs --from-row "$FROM" --prepare-only
touch automation/v2/work/.prepare-done
wait $WP
node automation/v2/write.mjs --from-row "$FROM"
