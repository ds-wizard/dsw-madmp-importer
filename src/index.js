import dsw from '@ds-wizard/integration-sdk'

const CONTRIBUTOR_ROLE_MAP = {
    'contactperson': '2c6ee59d-4dc9-4dcb-ac13-d969c317a117',
    'datacollector': 'fc789e2d-01ee-432d-82f9-1b659f58eaf8',
    'datacurator': '618cb529-0c24-4762-a739-7983004d1b2b',
    'datamanager': '627ab8dc-8026-498d-ba7a-3df122e29ede',
    'dataprotectionofficer': 'bc82b138-9816-46dd-8ff8-cea2826a3ad4',
    'datasteward': '3022098b-0e2c-4fad-9f28-cf2e1325521d',
    'distributor': '27dccf06-3b67-4c75-8888-6549e4da2d31',
    'editor': '100daf28-b55e-4b04-8295-f2aa83d0c734',
    'producer': '2085d67e-e144-4ec2-a788-1b26ac1cd7ab',
    'projectleader': '2d433965-55e3-4540-aae4-f85639d4e4fc',
    'projectmanager': 'cd2d1e0d-c5ad-4d0e-afa2-5ed143323cb7',
    'projectmember': '3d166766-6511-407b-a3e9-9565628fe05a',
    'researcher': 'c81c63b6-bec0-4e12-b9cd-247fa4338c1f',
    'rightsholder': '704ebc65-6932-4679-bbe5-f25c19843f0f',
    'sponsor': '374b887f-dfd8-4763-b360-b2a8aa12051c',
    'supervisor': '6dfde2b6-4234-47a0-b7da-ccb7412f8490',
    'workpackageleader': 'ce5476ed-5cc3-42ff-ac9d-d567f28cc2a6',
    'other': 'e957ecd5-baa2-4a3c-aaf1-735d416e5e11',
}

const unique = (arr) => [...new Set(arr)];

function getRoleUuid(role) {
    if (typeof role === 'string') {
        const key = role.toLowerCase().replace(/[^a-z]/gi, '')
        if (key in CONTRIBUTOR_ROLE_MAP) {
            return CONTRIBUTOR_ROLE_MAP[key]
        }
    }
    return CONTRIBUTOR_ROLE_MAP['other']
}

function importFunding(importer, prefix, funding) {
    const name = funding['funder_name']
    const grant = funding['grant_id']['identifier']
    const status = funding['funding_status']
    if ([name, grant, status].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const fundingPrefix = [...prefix, itemUuid]
    if (name !== undefined) {
        importer.setReply([...fundingPrefix, '0b12fb8c-ee0f-40c0-9c53-b6826b786a0c'], name)
    }
    if (grant !== undefined) {
        importer.setReply([...fundingPrefix, '1ccbd0bb-4263-4240-9dc5-936ef09eef53'], grant)
    }
    if (typeof status === 'string' && status.toLowerCase() === 'planned') {
        importer.setReply([...fundingPrefix, '54ff3b18-652f-4235-8f9f-3c87e2d63169'], '59ed0193-8211-4ee8-8d36-0640d99ce870')
    } else if (typeof status === 'string' && status.toLowerCase() === 'applied') {
        importer.setReply([...fundingPrefix, '54ff3b18-652f-4235-8f9f-3c87e2d63169'], '85fad342-a89d-414b-bc83-286a7417bb78')
    } else if (typeof status === 'string' && status.toLowerCase() === 'granted') {
        importer.setReply([...fundingPrefix, '54ff3b18-652f-4235-8f9f-3c87e2d63169'], 'dcbeab22-d188-4fa0-b50b-5c9d1a2fbefe')
    } else if (typeof status === 'string' && status.toLowerCase() === 'rejected') {
        importer.setReply([...fundingPrefix, '54ff3b18-652f-4235-8f9f-3c87e2d63169'], '8c0c9f28-4672-46ba-a939-48c2c892d790')
    }
}

function importProject(importer, prefix, project) {
    const title = project['title']
    const start = project['start']
    const end = project['end']
    const description = project['description']
    const fundings = project['funding']
    if ([title, start, end, description, fundings].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const projectPrefix = [...prefix, itemUuid]
    if (title !== undefined) {
        importer.setReply([...projectPrefix, 'f0ef08fd-d733-465c-bc66-5de0b826c41b'], title)
    }
    if (start !== undefined) {
        importer.setReply([...projectPrefix, 'de84b9b5-bcd0-4954-8370-72ea83916b8c'], start)
    }
    if (end !== undefined) {
        importer.setReply([...projectPrefix, 'cabc6f07-6015-454e-b97a-c34db4ec0c60'], end)
    }
    if (description !== undefined) {
        importer.setReply([...projectPrefix, '22583d74-3c98-4e0a-b363-26d767c88212'], description)
    }
    if (fundings !== undefined && Array.isArray(fundings)) {
        const fundingsUuid = '36a87eac-402d-43fb-a0df-ac5963bdf87d'
        const fundingsPrefix = [...projectPrefix, fundingsUuid]
        fundings.forEach((funding) => {
            importFunding(importer, fundingsPrefix, funding)
        })
    }
}

function importProjects(importer, madmp) {
    const chapterUuid = '1e85da40-bbfc-4180-903e-6c569ed2da38'
    const projectsUuid = 'c3dabaaf-c946-4a0d-889c-ede966f97667'
    const prefix = [chapterUuid, projectsUuid]
    const projects = madmp['dmp']['project']
    if (Array.isArray(projects)) {
        projects.forEach((project) => {
            importProject(importer, prefix, project)
        })
    }
}

function importContributorContact(importer, prefix, contact) {
    const name = contact['name']
    const mbox = contact['mbox']
    const contactId = contact['contact_id']['identifier']
    const contactIdType = contact['contact_id']['type']
    const orcid = contactIdType === 'orcid' ? contactId : undefined
    if ([name, mbox, orcid].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const contributorPrefix = [...prefix, itemUuid]
    if (name !== undefined) {
        importer.setReply([...contributorPrefix, '6155ad47-3d1e-4488-9f2a-742de1e56580'], name)
    }
    if (mbox !== undefined) {
        importer.setReply([...contributorPrefix, '3a2ffc13-6a0e-4976-bb34-14ab6d938348'], mbox)
    }
    if (orcid !== undefined) {
        importer.setReply([...contributorPrefix, '6295a55d-48d7-4f3c-961a-45b38eeea41f'], orcid)
    }
    const roleUuids = [CONTRIBUTOR_ROLE_MAP['contactperson']]
    importer.setReply([...contributorPrefix, '829dcda6-db8a-40ac-819a-92b9b52490f5'], roleUuids)
}

function importContributor(importer, prefix, contributor) {
    const name = contributor['name']
    const mbox = contributor['mbox']
    const contributorId = contributor['contributor_id']['identifier']
    const contributorIdType = contributor['contributor_id']['type']
    const roles = contributor['role']
    const orcid = contributorIdType === 'orcid' ? contributorId : undefined
    if ([name, mbox, orcid].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const contributorPrefix = [...prefix, itemUuid]
    if (name !== undefined) {
        importer.setReply([...contributorPrefix, '6155ad47-3d1e-4488-9f2a-742de1e56580'], name)
    }
    if (mbox !== undefined) {
        importer.setReply([...contributorPrefix, '3a2ffc13-6a0e-4976-bb34-14ab6d938348'], mbox)
    }
    if (orcid !== undefined) {
        importer.setReply([...contributorPrefix, '6295a55d-48d7-4f3c-961a-45b38eeea41f'], orcid)
    }
    if (Array.isArray(roles)) {
        const roleUuids = unique(roles.map(getRoleUuid))
        importer.setReply([...contributorPrefix, '829dcda6-db8a-40ac-819a-92b9b52490f5'], roleUuids)
    }
}

function importContributors(importer, madmp) {
    const chapterUuid = '1e85da40-bbfc-4180-903e-6c569ed2da38'
    const contributorsUuid = '73d686bd-7939-412e-8631-502ee6d9ea7b'
    const prefix = [chapterUuid, contributorsUuid]
    const contact = madmp['dmp']['contact']
    if (typeof contact === 'object') {
        importContributorContact(importer, prefix, contact)
    }
    const contributors = madmp['dmp']['contributor']
    if (Array.isArray(contributors)) {
        contributors.forEach((contributor) => {
            importContributor(importer, prefix, contributor)
        })
    }
}

function checkStringContains(str, q) {
    if (typeof str === 'string') {
        return str.toLowerCase().includes(q.toLowerCase())
    }
    return false
}

function importLicense(importer, prefix, license) {
    const name = license['license_name']
    const ref = license['license_ref']
    const date = license['start_date']
    if ([name, ref, date].every(x => x === undefined)) {
        return
    }
    const isPublic = checkStringContains(name, 'publicdomain') || checkStringContains(ref, 'publicdomain')
    const isCcBy = checkStringContains(name, 'cc-by') || checkStringContains(ref, 'cc-by')
    const itemUuid = importer.addItem(prefix)
    const licensePrefix = [...prefix, itemUuid]
    const licQUuid = 'ca0f9465-3116-4824-8651-b592151c5368'
    if (isPublic) {
        importer.setReply([...licensePrefix, licQUuid], 'd27a6e0f-55ea-4b25-bfb9-dcb4d6346fe0')
    } else if (isCcBy) {
        importer.setReply([...licensePrefix, licQUuid], '9186e183-e328-41f9-b012-149d0bbad9ea')
    } else {
        const otherUuid = '734d5f4e-91c0-4019-8164-8c70c2e0c8f2'
        importer.setReply([...licensePrefix, licQUuid], 'd27a6e0f-55ea-4b25-bfb9-dcb4d6346fe0')
        if (ref !== undefined) {
            importer.setReply([...licensePrefix, licQUuid, otherUuid, '375792f1-d7c3-4c8d-bf9e-f15ffa38e2fb'], ref)
        }
    }
    if (date !== undefined) {
        importer.setReply([...licensePrefix, '28d494ef-26c0-4632-956e-5cafcc498a32'], date)
    }
}

function importDistribution(importer, prefix, distribution) {
    const data_access = distribution['data_access']
    const licenses = distribution['license']
    if ([data_access, licenses].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const distributionPrefix = [...prefix, itemUuid]
    if (typeof data_access === 'string') {
        if (data_access.toLowerCase() === 'open') {
            importer.setReply([...distributionPrefix, '82fc0a41-8be0-407c-b2f8-95bf5b366187'], '1fd3e838-f92a-4086-8308-de17f6fa9d73')
        } else if (data_access.toLowerCase() === 'shared') {
            importer.setReply([...distributionPrefix, '82fc0a41-8be0-407c-b2f8-95bf5b366187'], '985366e7-7504-4f67-a8ee-90c340ff977a')
        } else if (data_access.toLowerCase() === 'closed') {
            importer.setReply([...distributionPrefix, '82fc0a41-8be0-407c-b2f8-95bf5b366187'], 'a8adc972-a2b6-4f5b-837b-20f83a685ed6')
        }
    }
    if (Array.isArray(licenses)) {
        const licensesUuid = '3d89e23d-ff5c-45da-97a8-169ad8c39be6'
        const licensesPrefix = [...distributionPrefix, licensesUuid]
        licenses.forEach((license) => {
            importLicense(importer, licensesPrefix, license)
        })
    }
}

function importDataset(importer, prefix, dataset) {
    const title = dataset['title']
    const description = dataset['description']
    const datasetId = dataset['dataset_id']['identifier']
    const datasetIdType = dataset['dataset_id']['type']
    const distributions = dataset['distribution']
    if ([title, description, datasetId, distributions].every(x => x === undefined)) {
        return
    }
    const itemUuid = importer.addItem(prefix)
    const datasetPrefix = [...prefix, itemUuid]
    if (title !== undefined) {
        importer.setReply([...datasetPrefix, 'b0949d09-d179-4491-9fb4-14b0deb9f862'], title)
    }
    if (description !== undefined) {
        importer.setReply([...datasetPrefix, '205a886d-83d7-4359-ae63-7103e05357c3'], description)
    }
    if (datasetId !== undefined) {
        const idsPrefix = [...datasetPrefix, 'cf727a0a-78c4-45a7-aa9b-cf7650ae873a']
        const idUuid = importer.addItem(idsPrefix)
        const idPrefix = [...idsPrefix, idUuid]
        importer.setReply([...idPrefix, '9e13b2d3-5f00-4e19-8a52-5c33c5b1cb07'], datasetId)
        if (typeof datasetIdType === 'string' && datasetIdType.toLowerCase() === 'handle') {
            importer.setReply([...idPrefix, '5c22cf59-89e3-43a1-af10-1af43a97bcb2'], 'b93a037a-006a-486f-87e0-6bef5c28879b')
        } else if (typeof datasetIdType === 'string' && datasetIdType.toLowerCase() === 'doi') {
            importer.setReply([...idPrefix, '5c22cf59-89e3-43a1-af10-1af43a97bcb2'], '48062bc9-0ffb-4509-bec6-e90641a30569')
        } else if (typeof datasetIdType === 'string' && datasetIdType.toLowerCase() === 'ark') {
            importer.setReply([...idPrefix, '5c22cf59-89e3-43a1-af10-1af43a97bcb2'], 'c353f027-823b-4242-9149-37dca26cf4bc')
        } else if (typeof datasetIdType === 'string' && datasetIdType.toLowerCase() === 'url') {
            importer.setReply([...idPrefix, '5c22cf59-89e3-43a1-af10-1af43a97bcb2'], '7a1d3b28-5f85-48b8-b052-2448c276d9fc')
        } else {
            importer.setReply([...idPrefix, '5c22cf59-89e3-43a1-af10-1af43a97bcb2'], '97236701-7b62-40f8-99a0-3b18d3fe3658')
        }
    }
    if (Array.isArray(distributions)) {
        const willDistUuid = 'a063da1c-aaea-4e18-85ec-f560d833f292'
        const willDistYesUuid = '8d1b07a7-f177-41f5-9532-05536223a8d6'
        importer.setReply([...datasetPrefix, willDistUuid], willDistYesUuid)
        const distributionsUuid = '81d3095e-a530-40a4-878e-ced42fabc4cd'
        const distributionsPrefix = [...datasetPrefix, willDistUuid, willDistYesUuid, distributionsUuid]
        distributions.forEach((distribution) => {
            importDistribution(importer, distributionsPrefix, distribution)
        })
    }
}

function importDatasets(importer, madmp) {
    const chapterUuid = 'd5b27482-b598-4b8c-b534-417d4ad27394'
    const datasetsUuid = '4e0c1edf-660c-4ebf-81f5-9fa959dead30'
    const prefix = [chapterUuid, datasetsUuid]
    console.log(madmp)
    const datasets = madmp['dmp']['dataset']
    if (Array.isArray(datasets)) {
        datasets.forEach((dataset) => {
            importDataset(importer, prefix, dataset)
        })
    }
}

function importMaDMP(importer, madmp) {
    importContributors(importer, madmp)
    importProjects(importer, madmp)
    importDatasets(importer, madmp)
}

function prepareImporter() {
    const importer = new dsw.Importer()

    importer
        .init()
        .then(() => {
            const fileSelector = document.getElementById('file-input')
            fileSelector.addEventListener('change', (event) => {
                const fileList = event.target.files
                console.log(fileList)
                if (fileList.length !== 1) {
                    alert('File not selected...')
                    return
                }
                const file = fileList[0]
                console.log('File: ' + file.name)

                const reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    let data = null
                    try {
                        data = JSON.parse(event.target.result)
                    } catch (error) {
                        showError('Failed to parse JSON file.')
                        return
                    }
                    try {
                        importMaDMP(importer, data)
                    } catch (error) {
                        showError('Failed to parse maDMP in JSON.')
                        return
                    }
                    try {
                        importer.send()
                    } catch (error) {
                        showError('Failed to send data back to the Wizard.')
                    }
                })
                reader.readAsText(file)
            })
        })
        .catch(error => {
            console.error(error)
            throw error
        })
}

function showError(message) {
    const errorDiv = document.getElementById('error')
    const errorAlert = document.getElementById('error-alert')
    errorAlert.textContent = message
    errorDiv.classList.toggle('hidden')
}

window.addEventListener('load', (event) => {
    prepareImporter()
})
