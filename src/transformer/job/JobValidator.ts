// Validator
export default async function JobValidator(job: any) {
    if (!job) {
        const jobList = await this.shared.get('storage').job.findAll().map((element: any) => '`' + element.name + '`')
        return [ false, `Le métier n'éxiste pas, veuillez en entrer un présent dans la liste suivante: ${jobList.join(', ')}.` ]
    }
    return [ true, null ]
}