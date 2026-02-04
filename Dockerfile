FROM node:20

# 安装 git (DevContainer 强依赖 git)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/qwerty-learner

# 这里的 CMD 不重要，DevContainer 会覆盖它，但写上是个好习惯
CMD [ "sleep", "infinity" ]