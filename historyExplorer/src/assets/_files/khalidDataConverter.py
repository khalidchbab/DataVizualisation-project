import pandas as pd
from urllib.parse import urlparse

def extract_website(row):
    return urlparse(row.url).netloc


df = pd.read_csv("./DrioucheDataRaw.csv")

df["website"] = df.apply(lambda row: extract_website(row),axis=1)

df.to_csv('DrioucheData.csv', sep=",")