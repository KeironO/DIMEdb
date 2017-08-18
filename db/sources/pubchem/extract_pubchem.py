import os, xmltodict, json, gzip, requests

def get_data(compound):
    cpd = xmltodict.parse(compound)["PC-Compound"]

    id = cpd["PC-Compound_id"]["PC-CompoundType"]["PC-CompoundType_id"]["PC-CompoundType_id_cid"]

    cpd_properties = cpd["PC-Compound_props"]["PC-InfoData"]

    for p in cpd_properties:
        check = p["PC-InfoData_urn"]["PC-Urn"]

        try:
            if check["PC-Urn_label"] == "InChI" and check["PC-Urn_name"] == "Standard":
                inchi = p["PC-InfoData_value"]["PC-InfoData_value_sval"]
        except Exception, err:
            print "ERROR FOUND (cpd", id, "INCHI)"
            pass

        try:
            if check["PC-Urn_label"] == "InChIKey" and check["PC-Urn_name"] == "Standard":
                inchi_key = p["PC-InfoData_value"]["PC-InfoData_value_sval"]
        except Exception, err:
            print "ERROR FOUND (cpd", id, "INCHIKEY)"
            pass
    try:
        response = requests.get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/%(cid)s/synonyms/JSON" % dict(cid=id))
        if response.status_code == 200:
            names = json.loads(response.text)["InformationList"]["Information"][0]["Synonym"]
        else:
            names = None
    except requests.exceptions.ConnectionError:
        names = None


    if inchi_key != None and names != None:
        return inchi_key, {
            "Name" : names[0],
            "Synonyms" : names[1:],
            "PubChem ID": id,
            "InChI": inchi
        }
    else:
        return None, None

if __name__ == "__main__":
    directory = "/home/keo7/.data/dimedb/"

    metabolite_text = ""

    stripped_metabolites = {}

    keep_going = False

    index = 0

    for file in os.listdir(directory+"pubchem/"):
        hmdb_xml = gzip.open(directory+"pubchem/"+file , "rb")

        for line in hmdb_xml:
            if line.strip() == "<PC-Compound>":
                keep_going = True
            if keep_going == True:
                metabolite_text += line
            if line.strip() == "</PC-Compound>":
                keep_going = False
                inchi, data = get_data(metabolite_text)
                if inchi != None:
                    index += 1
                    print index
                    stripped_metabolites[inchi] = data
                metabolite_text = ""

    with open(directory+"/stripped_pubchem.json", "wb") as out_file:
        json.dump(stripped_metabolites, out_file, indent=4)