sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageStrip"
], function (Controller, MessageBox, History, JSONModel, Filter, MessageStrip) {
	"use strict";

	return Controller.extend("project.ZVehicleTrackingDriver.controller.TripManager", {

		onInit: function () {
			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			this.getView().setModel(oModelTrip);
		},
		
		_getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		_onNavBack: function () {
			this._getRouter().navTo("Dashboard", {}, true);
		},
		
		_onPressMenu: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (oEvent.getSource().getText() === "Dashboard") {
				oRouter.navTo("Dashboard");
			} else if (oEvent.getSource().getText() === "Trip Manager") {
				oRouter.navTo("TripManager");
			}
		},
		
		onCancel: function (oEvent) {
			var oList = this.byId("tblTrips");

			var aItems = oList.getItems();
			var oModelItems = oList.getModel();
			var values = oModelItems.getData();

			var UpdateRecord = oEvent.getSource().getBindingContext().getObject();
			if (aItems.length > 0) {
				for (var i = 0; i < values.Trips.length; i++) {
					if (UpdateRecord.TripId === values.Trips[i].TripId && (values.Trips[i].Status === "COMPLETED" || values.Trips[i].Status ===
							"ONGOING")) {
						MessageBox.information("You Can not Cancel this trip");

					} else if (UpdateRecord.TripId === values.Trips[i].TripId && values.Trips[i].Status === "CANCELLED") {
						MessageBox.information("This trip is already cancelled");
					} else {
						if (values.Trips[i].TripId === UpdateRecord.TripId) {
							//	pop this._data.Products[i] 
							values.Trips[i].Status = "CANCELLED";
							values.Trips[i].Type = "Error";
							oModelItems.refresh();
							break;
						}
						oModelItems.setData(values);
						oList.setModel(oModelItems);
					}

				}

			}
		},

		onSearch: function (oEvent) {
			var query = oEvent.getSource().getValue();
			if (query && query.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("TripId", sap.ui.model.FilterOperator.Contains, query);
				var oFilter2 = new sap.ui.model.Filter("RegistrationNo", sap.ui.model.FilterOperator.Contains, query);
				var oFilter3 = new sap.ui.model.Filter("DriverName", sap.ui.model.FilterOperator.Contains, query);
				var oFilter4 = new sap.ui.model.Filter("VehicleRouteFrom", sap.ui.model.FilterOperator.Contains, query);
				var oFilter5 = new sap.ui.model.Filter("VehicleRouteTo", sap.ui.model.FilterOperator.Contains, query);
				var oFilter6 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, query);
				var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5,oFilter6], false);

			}
			
			var obinding = this.getView().byId("tblTrips").getBinding("items");
			obinding.filter(allFilter);
		},
		
		_onViewInfo: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var objTrip = oEvent.getSource().getBindingContext().getObject();
			//Get the Model. 
			oRouter.navTo("ViewTrip", {
				TripId: objTrip.TripId
			});
		}

	});

});