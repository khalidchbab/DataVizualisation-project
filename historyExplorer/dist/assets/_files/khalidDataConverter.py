import pandas as pd
from urllib.parse import urlparse

def extract_website(row):
    return urlparse(row.url).netloc


df = pd.read_csv("./KhalidDataRaw.csv")

df["website"] = df.apply(lambda row: extract_website(row),axis=1)

df.to_csv('KhalidData.csv', sep=",")