# 读取txt文件，每一行为一个url，下载图片，重命名从1开始
import time

import requests


class DownloadImg:
    def __init__(self):
        self.path = './img/'
        self.file = './url.txt'
        self.i = 1

    def download(self):
        with open(self.file, 'r') as f:  # 打开文件
            for line in f.readlines():  # 逐行读取
                line = line.strip('\n')  # 去掉换行符
                print(line)  # 打印
                try:
                    r = requests.get(line, timeout=30)
                    r.raise_for_status()  # 如果状态不是200，引发HTTPError异常
                    r.encoding = r.apparent_encoding
                    with open(self.path + str(self.i) + '.jpg', 'wb') as f:
                        f.write(r.content)
                        f.close()
                        print('文件保存成功')
                        self.i += 1  # 下载成功，i加1
                except:
                    print('爬取失败')
                    continue


if __name__ == '__main__':
    download = DownloadImg()
    download.download()
