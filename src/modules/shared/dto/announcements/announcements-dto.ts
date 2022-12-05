export class AnnouncementsDto {
    _id?: string;
    title: string = "";
    body: string = "";
    date?: string = "";
    auther?: string = "";
    category: Category
}

export class Category {
    general?: boolean = true;
    admins?: boolean = false;
    investors?: boolean = false;
    contributors?: boolean = false;
    subContributors?: boolean = false;
    superContributors?: boolean = false;
}