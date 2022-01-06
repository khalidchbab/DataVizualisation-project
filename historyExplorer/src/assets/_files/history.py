import pandas as pd
from urllib.parse import urlparse

def extract_website(row):
    return urlparse(row.url).netloc


df = pd.read_csv("./myhistory.csv")

df["website"] = df.apply(lambda row: extract_website(row),axis=1)

idk = df.groupby(['website']).website.count()
print(idk.sort_values(ascending=False).head(10))

df_h = idk.sort_values(ascending=False).head(10)

df_h.to_csv('idk.csv', sep=";")