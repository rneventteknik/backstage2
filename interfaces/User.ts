namespace Backstage2.Models {
    export interface User extends BaseEntityWithName {
        role: Role;
        memberStatus: MemberStatus;
        nameTag: string;
        phoneNumber: string;
        slackId: string;
    }
}