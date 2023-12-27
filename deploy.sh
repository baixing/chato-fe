#!/bin/sh

# 输出当前日期，便于调试
DATETIME=$( date "+%Y-%m-%d %H:%M:%S" )
echo "[Deploy] Time: ${DATETIME}"

# 基本信息
APP_NAME='zhinenghao.cn' # zhinenghao 服务器密码： ubuntu Chato2023*
# 源文件目录
SRC_DIR=$( pwd )
# 构建产物目录
DIST_DIR="${SRC_DIR}/dist"
# 部署目标目录
DEST_DIR="/opt/case/${APP_NAME}"

# 命令行参数
# PARAM="$1"

# if [ "$PARAM" == '' ]; then
#  echo '[Deploy] Must specify target env (`prod` or `test`)!'
#  exit 1
# fi

SVR=124.223.87.180 #  国内
USER="ubuntu"

echo "[Deploy] Target env is: $SVR ($APP_NAME)"
echo "[Deploy] Dest dir is: $DEST_DIR"

# 部署目标目录
SERVER_DIR="$USER@$SVR:$DEST_DIR"

#上传，不排除dist
scp -r $DIST_DIR $SERVER_DIR

# 使用rsync命令上传，排除dist/assets目录
# rsync -av --exclude 'assets/' $DIST_DIR $SERVER_DIR
