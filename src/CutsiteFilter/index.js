import { connect } from "react-redux";
import { compose } from "redux";
import { Icon, Classes } from "@blueprintjs/core";

import withEditorProps from "../withEditorProps";
import specialCutsiteFilterOptions from "../constants/specialCutsiteFilterOptions";

import React from "react";
import "./style.css";
import { TgSelect } from "teselagen-react-components";

import map from "lodash/map";
import { flatMap } from "lodash";

export class CutsiteFilter extends React.Component {
  static defaultProps = {
    onChangeHook: () => {},
    closeDropDown: () => {},
    filteredRestrictionEnzymes: [],
    filteredRestrictionEnzymesUpdate: () => {},
    allCutsites: { cutsitesByName: {} },
    sequenceData: {
      sequence: ""
    }
  };

  getManageEnzymesLink = () => (
    <span
      onClick={() => {
        // e.stopPropagation();
        const {
          createYourOwnEnzymeReset,
          showManageEnzymesDialog,
          sequenceData,
          closeDropDown
        } = this.props;
        closeDropDown();
        createYourOwnEnzymeReset();
        showManageEnzymesDialog({
          inputSequenceToTestAgainst: sequenceData ? sequenceData.sequence : ""
        });
      }}
      className={"ta_link " + Classes.POPOVER_DISMISS}
    >
      Manage enzymes &nbsp;
      <Icon iconSize={14} icon="cut" />
    </span>
  );

  renderOptions = ({ label, value, canBeHidden }, props) => {
    if (value === "manageEnzymes") {
      return this.getManageEnzymesLink();
    }
    const {
      filteredRestrictionEnzymes,
      filteredRestrictionEnzymesUpdate
    } = props;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%"
        }}
      >
        {label}{" "}
        {canBeHidden && (
          <Icon
            onClick={e => {
              e.stopPropagation();

              filteredRestrictionEnzymesUpdate(
                flatMap(filteredRestrictionEnzymes, e => {
                  if (e.value === value) return [];
                  return e;
                }).concat({
                  label,
                  className: "veHiddenEnzyme",
                  value,
                  // hiddenEnzyme: true,
                  isHidden: true,
                  canBeHidden
                })
              );
            }}
            htmlTitle="Hide this enzyme"
            className="veHideEnzymeBtn"
            style={{ paddingTop: 5 }}
            iconSize={14}
            icon="eye-off"
          ></Icon>
        )}
      </div>
    );
  };

  render() {
    let {
      onChangeHook,
      style = {},
      filteredRestrictionEnzymes,
      filteredRestrictionEnzymesUpdate,
      allCutsites: { cutsitesByName }
      // ...rest
    } = this.props;
    const userEnzymeGroups = window.getExistingEnzymeGroups();
    // var {handleOpen, handleClose} = this
    let options = [
      ...map(specialCutsiteFilterOptions, opt => opt),
      ...map(userEnzymeGroups, (g, name) => {
        return {
          label: (
            <span>
              <Icon size={10} icon="user"></Icon>&nbsp;{name}
            </span>
          ),
          value: "__userCreatedGroup" + name
        };
      }),

      ...Object.keys(cutsitesByName).map(function(key) {
        const label = getLabel(cutsitesByName[key], key);
        return {
          canBeHidden: true,
          label,
          // hiddenEnzyme: false,
          value: key
        };
      })
    ];
    // function openManageEnzymes() {
    //   dispatch({
    //     type: "CREATE_YOUR_OWN_ENZYME_RESET"
    //   });
    //   dispatch({
    //     type: "CREATE_YOUR_OWN_ENZYME_RESET",
    //     payload: {
    //       inputSequenceToTestAgainst
    //     }
    //   });
    // }
    return (
      <div style={style}>
        <TgSelect
          multi
          allowCreate
          wrapperStyle={{ zIndex: 11 }}
          noResultsText={
            <div className="noResultsTextPlusButton">
              No matching enzymes found that cut in the sequence.{" "}
              {this.getManageEnzymesLink()}
            </div>
          }
          placeholder="Filter cut sites..."
          options={options}
          filteredRestrictionEnzymes={filteredRestrictionEnzymes}
          filteredRestrictionEnzymesUpdate={filteredRestrictionEnzymesUpdate}
          optionRenderer={this.renderOptions}
          isSimpleSearch
          onChange={filteredRestrictionEnzymes => {
            if (
              filteredRestrictionEnzymes &&
              filteredRestrictionEnzymes.some(
                enzyme =>
                  enzyme.value ===
                  specialCutsiteFilterOptions.manageEnzymes.value
              )
            ) {
              return;
            }
            onChangeHook && onChangeHook(filteredRestrictionEnzymes);
            filteredRestrictionEnzymesUpdate(filteredRestrictionEnzymes);
          }}
          value={filteredRestrictionEnzymes.map(filteredOpt => {
            if (filteredOpt.cutsThisManyTimes) {
              return filteredOpt;
            }
            if (filteredOpt.value.includes("__userCreatedGroup")) {
              return filteredOpt;
            }

            const label = getLabel(
              cutsitesByName[filteredOpt.value],
              filteredOpt.value
            );
            return {
              ...filteredOpt,
              label
            };
          })}
        />
      </div>
    );
  }
}

export default compose(withEditorProps, connect())(CutsiteFilter);

const getLabel = (maybeCutsites = [], val) => {
  const cutNumber = maybeCutsites.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      {" "}
      <div>{val}</div>{" "}
      <div style={{ fontSize: 12 }}>
        &nbsp;({cutNumber} cut{cutNumber === 1 ? "" : "s"})
      </div>
    </div>
  );
};
