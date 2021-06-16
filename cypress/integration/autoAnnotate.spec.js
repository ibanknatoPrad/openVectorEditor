describe("autoAnnotate", function () {
  beforeEach(() => {
    cy.visit("#Editor");
  });
  it(`the auto-annotate tools should show up if their respective handlers are shown`, () => {
    cy.triggerFileCmd("Auto Annotate", { noEnter: true });
    cy.contains("Auto Annotate").should("not.exist");
    cy.tgToggle("passAutoAnnotateHandlers");
    cy.triggerFileCmd("Auto Annotate", { noEnter: true });
    cy.contains("Auto Annotate").should("exist");
    cy.contains("Auto Annotate Features").click();
    cy.contains("auto annotate features callback triggered");
  });
  it.only(`the auto annotation ape upload addon should work`, () => {
    cy.tgToggle("withAutoAnnotateAddon");
    cy.hideCutsites();
    cy.hideParts();
    cy.removeFeatures();
    cy.triggerFileCmd("Auto Annotate Features");
    cy.contains("ApE File").click();
    cy.uploadFile(`.bp3-dialog .tg-dropzone`, "Default_Features.txt");
    cy.contains("button", "Annotate").click();
    cy.contains(`Detected that Row 18 has a non-standard type of UTR. We will assign it and all subsequent non-standard types to use the misc_feature type instead`)
    
    cy.contains('button', 'OK').click()
    // cy.contains("10 Selected");
    // cy.get(`.rt-tr:contains(Example Feature 1)`).click();
    // cy.get(`.rt-tr:contains(Example Feature 2)`);
    // cy.get(`.rt-tr:contains(Example Feature 3):contains(1)`);
    // cy.get(`.rt-tr:contains(Reverse Feature):contains(-1)`);

    // cy.contains("button", "Add").click();
    // cy.contains(".veCircularViewLabelText", "Example Feature 2");
    // cy.contains("Example Feature 2 - Start: 135 End: 165");

    // cy.contains(".veCircularViewLabelText", "Example Feature 1").should(
    //   "not.exist"
    // );
    // cy.get(
    //   `.veFeature:contains(Reverse Feature - Start: 1577 End: 2801) path[fill="#EF6500"]`
    // ); //it should be orange
    // cy.contains(".veCircularViewLabelText", "Example Feature 3").dblclick();
    // cy.get(`.bp3-radio input[name="forward"][value="true"]`);
    // cy.get(`.tg-select-value:contains(primer_bind)`);
  });
  it(`the auto annotation csv upload addon should work`, () => {
    cy.tgToggle("withAutoAnnotateAddon");
    cy.hideCutsites();
    cy.hideParts();
    cy.removeFeatures();
    cy.triggerFileCmd("Auto Annotate Features");

    cy.uploadFile(
      `.bp3-dialog .tg-dropzone`,
      "csvAnnotationList.csv",
      "text/csv"
    );
    cy.contains("button", "Annotate").click();
    cy.contains("10 Selected");
    cy.get(`.rt-tr:contains(Example Feature 1)`).click();
    cy.get(`.rt-tr:contains(Example Feature 2)`);
    cy.get(`.rt-tr:contains(Example Feature 3):contains(1)`);
    cy.get(`.rt-tr:contains(Reverse Feature):contains(-1)`);

    cy.contains("button", "Add").click();
    cy.contains(".veCircularViewLabelText", "Example Feature 2");
    cy.contains("Example Feature 2 - Start: 135 End: 165");

    cy.contains(".veCircularViewLabelText", "Example Feature 1").should(
      "not.exist"
    );
    cy.get(
      `.veFeature:contains(Reverse Feature - Start: 1577 End: 2801) path[fill="#EF6500"]`
    ); //it should be orange
    cy.contains(".veCircularViewLabelText", "Example Feature 3").dblclick();
    cy.get(`.bp3-radio input[name="forward"][value="true"]`);
    cy.get(`.tg-select-value:contains(primer_bind)`);
  });
});
