describe("primers.spec", () => {
  it(`primers should have their custom bases or underlying bases displayed in the properties panel`, function () {
    cy.visit(
      "/#/Editor?allowPrimerBasesToBeEdited=true&focusProperties=true&propertyTab=primers"
    );
    cy.contains(
      `[data-test="tgCell_bases"]`,
      `tgtgcgacgctggcgatatca`
    ).dblclick();
    cy.get(`.tg-custom-sequence-editable:contains(tgtgcgacgctggcgatatca)`).type(
      "{uparrow}AAA"
    ); //add the uparrow to make sure we're at the start of the input
    cy.get("button:contains(Save)").click();
    cy.contains(`[data-test="tgCell_bases"]`, `AAAtgtgcgacgctggcgatatca`);
  });
  it(`allowPrimerBasesToBeEdited=true should allow bases to be specified for a given primer`, function () {
    cy.visit("/#/Editor?allowPrimerBasesToBeEdited=true");
    cy.contains("text", "Example Primer 1").dblclick();
    // cy.contains(`.tg-custom-sequence-editable`, "tgtgcgacgctggcgatatca");
    cy.get(`.tg-custom-sequence-editable:contains(tgtgcgacgctggcgatatca)`).type(
      "{uparrow}AAA"
    ); //add the uparrow to make sure we're at the start of the input
    cy.contains(`Length: 24`);
    cy.contains(`.veRowViewPrimer`, "AAAtgtgcgacgctggcgatatca"); //shows up in the row view live
    cy.get(`.bp3-dialog .tg-no-match-seq:contains(A)`).should("have.length", 3); //the A's should be shown as non-matches
    cy.get(`.veRowViewPrimer .tg-no-match-seq:contains(A)`).should(
      "have.length",
      3
    ); //the A's should be shown as non-matches
    cy.get("button:contains(Save)").click();

    // cy.selectRange(30, 90);
    // cy.triggerFileCmd("New Primer");
  });
  it(`allowPrimerBasesToBeEdited=true specified bases should show up correctly in the genbank`, function () {
    cy.visit(
      "/#/Editor?allowPrimerBasesToBeEdited=true&focusProperties=true&propertyTab=genbank"
    );
    cy.contains(".veRowViewPrimer", "Example Primer 1").dblclick();
    // cy.contains(`.tg-custom-sequence-editable`, "tgtgcgacgctggcgatatca");
    cy.get(`.tg-custom-sequence-editable:contains(tgtgcgacgctggcgatatca)`).type(
      "{uparrow}AAA"
    ); //add the uparrow to make sure we're at the start of the input
    // cy.contains(`Length: 24`)
    // cy.contains(`.veRowViewPrimer`, 'AAAtgtgcgacgctggcgatatca') //shows up in the row view live
    // cy.get(`.bp3-dialog .tg-no-match-seq:contains(A)`).should('have.length', 3); //the A's should be shown as non-matches
    // cy.get(`.veRowViewPrimer .tg-no-match-seq:contains(A)`).should('have.length', 3); //the A's should be shown as non-matches
    cy.get("button:contains(Save)").click();

    // underline SHOULD show up for misses

    //underlying primer should show up properly

    //some sort of visual indication should show up at all times for mismatches

    // cy.selectRange(30, 90);
    // cy.triggerFileCmd("New Primer");
  });
  it(`double clicking the primer you're already editing shouldn't cause ui issues`, function () {
    cy.visit("/#/Editor?allowPrimerBasesToBeEdited=true");
    cy.contains("text", "Example Primer 1").dblclick();
    cy.get('input[value="Example Primer 1"]');
    cy.contains(
      ".veRowViewPrimer text.veLabelText",
      "Example Primer 1"
    ).dblclick({ force: true });
    cy.get('input[value="Example Primer 1"]').should("exist"); //we used to allow re-open of the currently being edited dialog which would clear the initial values for some reason..
  });
});
