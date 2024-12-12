using my.librarysys as my from '../db/schema';

@path: '/LibrarySystemSRV'
service CatalogService {
    // @restrict: [{
    //     grant: '*',
    //     to   : 'Admin'
    // }]

    entity Books         as projection on my.Books;
    entity users         as projection on my.users;
    entity BookLoans     as projection on my.BookLoans;
    entity IssueingBooks as projection on my.IssueingBooks;
    entity ReturnedBooks as projection on my.ReturnedBooks;
}