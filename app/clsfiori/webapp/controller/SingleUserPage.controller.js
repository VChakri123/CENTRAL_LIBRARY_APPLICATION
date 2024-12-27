sap.ui.define([
  // "sap/ui/core/mvc/Controller"
  "./BaseController",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], (BaseController, ODataModel, Fragment, MessageBox, MessageToast, Filter, FilterOperator) => {
  "use strict";

  return BaseController.extend("com.app.clsfiori.controller.SingleUserPage", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
    },
    onUserDetailsLoad: function (oEvent) {
      const { ID } = oEvent.getParameter("arguments");
      this.id = ID;
      const oObjectPage = this.getView().byId("ObjectPageLayout");
      oObjectPage.bindElement(`/users(${ID})`);
    },

    onReserveBookPress: async function (oEvent) {
      let selectedItems = this.byId("idBooksTable").getSelectedItems();
      if (selectedItems.length !== 1) {
        MessageToast.show(selectedItems.length > 1 ? "Please select only one Book to Reserve..!" : "Please select at least one Book Reserve..!");
        return;
      }

      // if (this.byId("idBooksTable").getSelectedItems().length === 0) {
      //   MessageToast.show("Please Select at least one Book Reserve..!");
      //   return;
      // }
      // if (this.byId("idBooksTable").getSelectedItems().length > 1) {
      //   MessageToast.show("Please Select only one Book to Reserve..!");
      //   return;
      // }
      var oSelectedItem = oEvent.getSource().getParent();
      var oSelectedUser = oSelectedItem.getBindingContext().getObject();
      var oSelectedBook = this.byId("idBooksTable").getSelectedItem().getBindingContext().getObject();
      const oModel = this.getView().getModel("ModelV2");

      const aFilters = [
        new Filter("user12_ID", FilterOperator.EQ, oSelectedUser.ID),
        new Filter("Book12_ID", FilterOperator.EQ, oSelectedBook.ID)
      ];

      const aExistingReservations = await new Promise((resolve, reject) => {
        oModel.read("/IssueingBooks", {
          filters: aFilters,
          success: function (oData) {
            resolve(oData.results);
          },
          error: function (oError) {
            reject(oError);
          }
        });
      });

      if (aExistingReservations.length > 0) {
        MessageBox.error("You have already reserved this book.");
        return;
      }

      const userModel = new sap.ui.model.json.JSONModel({
        user12_ID: oSelectedUser.ID,
        Book12_ID: oSelectedBook.ID,
        reservedDate: new Date(),
      });
      this.getView().setModel(userModel, "userModel");

      const oPayload = this.getView().getModel("userModel").getProperty("/");

      try {
        await this.createData(oModel, oPayload, "/IssueingBooks");
        MessageBox.success("Book Reserved Successfully..!");
      } catch (error) {
        MessageBox.error("Some Technical Issue.");
      }
      // Clear table selections and refresh the table data
      const oTable = this.byId("idBooksTable");
      oTable.removeSelections(true); // Clear any selections
      oTable.getBinding("items").refresh(); // Refresh the table binding
      // MessageToast.show("Table refreshed successfully!");
    },

    //RETURN REFRESH BORROWED BOOKS
    onReturnBooksRefreshBtn: function () {
      const oView = this.getView();
      oView.byId("idUserActiveLoanTable").getBinding("items").refresh();
      MessageToast.show("User ActiveLoans table refreshed Succesfully!");
    },
    onReturnBookPress: async function () {
      const oView = this.getView();
      const aSelectedItems = oView.byId("idUserActiveLoanTable").getSelectedItems();

      // Validation: Check if no items are selected
      if (aSelectedItems.length !== 1) {
        sap.m.MessageToast.show(
          aSelectedItems.length > 1 ? "Please select only one book to return!" : "Please select at least one book to return!");
        return;
      }


      // Validation: Check if more than one item is selected
      if (aSelectedItems.length > 1) {
        sap.m.MessageBox.error("You can return only one book at a time. Please select a single book.");
        return;
      }

      // Proceed with a single selected item
      const oSelectedItem = aSelectedItems[0];
      const oContext = oSelectedItem.getBindingContext().getObject();
      const userModel = new sap.ui.model.json.JSONModel({
        user14_ID: oContext.ID,
        book14_ID: oContext.book.ID,
        ReturnDate: new Date(),
      });
      oView.setModel(userModel, "userModel");

      const oPayload = oView.getModel("userModel").getProperty("/"),
        oModel = oView.getModel("ModelV2");

      // Confirmation dialog
      sap.m.MessageBox.confirm(`Are you sure you want to return the book "${oContext.book.Title}"?`, {
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: async (oAction) => {
          if (oAction === sap.m.MessageBox.Action.OK) {
            try {
              await this.createData(oModel, oPayload, "/ReturnedBooks");
              sap.m.MessageBox.success(`Book "${oContext.book.Title}" returned successfully.`);
              this.byId("idUserActiveLoanTable").getBinding("items").refresh();
            } catch (error) {
              sap.m.MessageBox.error(`Failed to return book "${oContext.book.Title}".`);
            }
          }
        },
      }
      );
    },


    //SEARCH
    onSearchBooksFromTable: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");

      var aFilters = [];

      if (sQuery && sQuery.length > 0) {
        aFilters.push(new Filter("Title", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("Author", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("ISBN", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("Language", FilterOperator.Contains, sQuery));


        var oFinalFilter = new Filter({
          filters: aFilters,
          and: false
        });

        this.getView().byId("idBooksTable").getBinding("items").filter(oFinalFilter);
      } else {
        this.getView().byId("idBooksTable").getBinding("items").filter([]);
      }
    },


    //LOGOUT BUTTON
    onLogoutBtnPress: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteHome", {}, true)
    },
  });
});
