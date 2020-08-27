sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("project.ZVehicleTrackingDriver.controller.Dashboard", {
		onInit: function () {
			var that = this;
			that._loadDashboard();
		},

		_loadDashboard: function (oEvent) {

			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			var totalupcoming = 2;
			var totalcompleted = 0;
			var totalcancelled = 0;
			if (oModelTrip.getData().Trips.length > 0) {

				for (var i = 0; i < oModelTrip.getData().Trips.length; i++) {
					if (oModelTrip.getData().Trips[i].Status === "UPCOMING") {

						totalupcoming = totalupcoming + 1;
						var countupcoming = this.getView().byId("countupcoming");
						countupcoming.setValue(totalupcoming);

					} else if (oModelTrip.getData().Trips[i].Status === "COMPLETED") {

						totalcompleted = totalcompleted + 1;
						var countcompleted = this.getView().byId("countcompleted");
						countcompleted.setValue(totalcompleted);
					} else if (oModelTrip.getData().Trips[i].Status === "CANCELLED") {

						totalcancelled = totalcancelled + 1;
						var countcancelled = this.getView().byId("countcancelled");
						countcancelled.setValue(totalcancelled);
					}
				}
			}

			this.getView().setModel(oModelTrip);

			var Status1 = "UPCOMING";
			var Status2 = "COMPLETED";
			if (Status1 && Status1.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, Status1);
				var obinding1 = this.getView().byId("tblUpcomingTrips").getBinding("items");
				obinding1.filter(oFilter1);
			}
			if (Status2 && Status2.length > 0) {
				var oFilter2 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, Status2);
				var obinding2 = this.getView().byId("tblCompletedTrips").getBinding("items");
				obinding2.filter(oFilter2);
			}

		},
		_onPressMenu: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (oEvent.getSource().getText() === "Dashboard") {
				oRouter.navTo("Dashboard");
			} else if (oEvent.getSource().getText() === "Trip Manager") {
				oRouter.navTo("TripManager");
			}
		},

		_onViewDetailsOngoing: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var objTrip = oEvent.getSource().getBindingContext().getObject();
			//Get the Model. 
			oRouter.navTo("ViewTrip", {
				TripId: objTrip.TripId
			});
		},
		_onViewDetailsUpcoming: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var objTrip = oEvent.getSource().getBindingContext().getObject();
			//Get the Model. 
			oRouter.navTo("ViewTrip", {
				TripId: objTrip.TripId
			});
		},

		_onViewInfo: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var objTrip = oEvent.getSource().getBindingContext().getObject();
			//Get the Model. 
			oRouter.navTo("ViewTrip", {
				TripId: objTrip.TripId
			});
		},
		_onPressTiles: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TripManager");
		},
	});
});