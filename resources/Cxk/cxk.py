import requests
from bs4 import BeautifulSoup
import os


class DownloadImg:
    def __init__(self):
        self.path = './img/'
        self.url_prefix = 'https://remeins.com/index/resimg/bqb/ikun/'
        self.i = 1

    def download(self):
        # 一共100页
        for index in range(0, 101):
            url = self.url_prefix + str(index)
            # 发送请求
            response = requests.get(url)

            # 解析HTML
            soup = BeautifulSoup(response.content, 'html.parser')

            # 获取所有图片标签
            img_tags = soup.find_all('img')

            # 创建一个文件夹，用于存储所有的图片
            if not os.path.exists(self.path):
                os.makedirs(self.path)

            # 遍历所有图片标签，下载图片并保存到本地
            for img in img_tags:
                img_url = img.get('src')
                if img_url.startswith('http'):
                    img_name = img_url.split('/')[-1]
                    # TODO 可以对图片过滤，并不是所有的img都是cxk表情包
                    img_path = os.path.join(self.path, img_name)
                    with open(img_path, 'wb') as f:
                        f.write(requests.get(img_url).content)
                        print(f'Saved {img_name}')


if __name__ == '__main__':
    download = DownloadImg()
    download.download()
