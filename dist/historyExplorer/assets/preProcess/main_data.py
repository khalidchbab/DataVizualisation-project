#
import random
from collections import Counter
import json as json
from yarl import URL
import re 

oneMonth = "data\chrome_history.json"
oneMonthTest = "data\chrome_history_test.json"
oneYear = "data\chrome_history_year.json"
oneYearTest = "data\chrome_history_year_test.json"
oneMillion = "data\chrome_history_1m.json"

# with open(oneMonth, encoding='utf-8') as f:
#     data = json.loads(f.read())




# len_json = len(data)
# print(len_json)

# with open(oneMonthTest, "r+", encoding='utf-8') as file:
#     data = json.load(file)
#     if data['webSite'] == 'Other':


#########################################################
#################### Testing ############################
# with open(oneMonthTest, "r+", encoding='utf-8') as file:
#     data = json.load(file)
#     for d in data:
#         if d['Count'] < 100:
#             d['webSite'] = 'Other'
#     file.seek(0)
#     json.dump(data, file, indent=4, sort_keys=True)

#########################################################
##################### Get unique values #################
# with open("data\chrome_history_new.json", encoding='utf-8') as f:
#     data = json.loads(f.read())

# with open("data\chrome_history_new.json", "w+", encoding='utf-8') as file:
#     # data = json.loads(file.read())
#     cmp = 0
#     for i in range(len(data)):
#         if cmp and data[i]["webSite"] == "Other":
#             data.pop(i)
#         if data[i]["webSite"] == "Other" :
#             cmp = 1
#     json.dump(data, file, indent=4, sort_keys=True)


    # for d in data:
    #     s = URL(d['url'])
    #     d['webSite'] = s.host
    
    # unique = { el['webSite'] : el for el in data }.values()
    # file.seek(0)
    # json.dump(list(unique), file, indent=4, sort_keys=True)
# print(len(data))
# print(len(unique))

#########################################################
##################### For Pie CHart #####################
# oneMonth = "data\chrome_history_new.json"
# count = 0 
# def get_count(json_file, element):
#     cmp = 0.0
#     with open(json_file, "r", encoding='utf-8') as file:
#         data = json.load(file)
#     # len_json = len(data)
#     for d in data :
#         if d['webSite'] == element:
#             cmp += 1

#     return cmp

# i = 0
# with open(oneMonthTest, "r+", encoding='utf-8') as file:
#     data = json.load(file)
    
#     for d in data:
#         print('==================')
#         # print(get_count(oneMonth, d['webSite']))
#         if d['webSite'] == 'Other':
#             d['Count'] = get_count(oneMonthTest, d['webSite'])

#     file.seek(0)
#     json.dump(data, file, indent=4, sort_keys=True)

########################################################
########################################################

#######################################################
######### 1 Adding just website to the json file ######
# oneMonth = oneYearTest
# with open(oneMonth, "r+", encoding='utf-8') as file:
#     data = json.load(file)
#     for d in data:
#         s = URL(d['url'])
#         d['webSite'] = s.host

#     file.seek(0)
#     json.dump(data, file, indent=4, sort_keys=True)
#######################################################
########### 2 Calculate Number of occurence ###########

# with open(oneYearTest, "r", encoding='utf-8') as file:
#     data = json.load(file)
#     c = Counter(el['webSite'] for el in data)
# # print(dict(c))
#     c  = dict(c)

#     # print(c)
#     li = []  ## List of dictionary 
#     for el in c:
#         aux_dict = {}
#         aux_dict['Website'] = el
#         aux_dict['Count'] = c[el]
#         li.append(aux_dict)
#         # print( c[el])
# newlist = sorted(li, key=lambda d: d['Count'], reverse= True) 
# with open('data/pieChart_v1_data.json', 'w') as fp:
#     json.dump(newlist[:30], fp, indent=4)

# print(li)
#######################################################
#######################################################

def check(el, li):
    for element in li:
        # print(type(el))
        if element in el:
            # print(type(element))
            return True
    return False


def generate_data(file):
    entertainment = ['youtube', 'blablacar', 'sflix'] # groupe 0
    education = ['indeed', 'liris', 'univ-lyon1'] # groupe 1
    coding = ['stackoverflow', 'github'] # groupe 2
    socialMedia = ['linkedin', 'facebook'] # groupe 3
    search = 'google' # groupe 4

    graph = {}
    with open(file, "r", encoding='utf-8') as file:
        data = json.load(file)

    nodes = []
    links = []
    li_aux = []

    for el in data :
        li_aux.append(el['Website'])
        dict_node = {}
        dict_node['id'] = el['Website']
        dict_node['Count'] = el['Count']
        
        if el['Website'] == None:
            continue
        if check(el['Website'], entertainment) :
            dict_node['group'] = 6
        elif check(el['Website'], education):
            dict_node['group'] = 1
        elif check(el['Website'], coding):
            dict_node['group'] = 2
        elif check(el['Website'], socialMedia):
            dict_node['group'] = 3
        elif check(el['Website'], search):
            dict_node['group'] = 4
        else:
            dict_node['group'] = 5

        # dict_node['value'] = random.randrange(10)

        nodes.append(dict_node)
        
    for i in range(0,80):
        links.append({"source" :random.choice(li_aux) , "target" : random.choice(li_aux), "value" : random.randrange(10)})

    
    graph['nodes'] = nodes
    graph['links'] = links

    # print(graph)
    with open('data/graph.json', 'w') as fp:
        json.dump(graph, fp, indent=4)


def main():
    path = "data/pieChart_v1_data.json"
    generate_data(path)

if __name__ == "__main__":
    # education = ['indeed', 'liris', 'univ-lyon1']
    main()
    # print('univ-lyon1' in 'univ-lyon1.jobteaser.com')

