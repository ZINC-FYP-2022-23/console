import Button from "@/components/Button";

describe("<Button />", () => {
  it("renders a button", () => {
    cy.mount(<Button>Click me</Button>);
    cy.get("button").should("have.text", "Click me");
  });

  it("fires onClick when clicked", () => {
    const onClickSpy = cy.spy().as("onClickSpy");
    cy.mount(<Button onClick={onClickSpy}>Click me</Button>);
    cy.get("button").click();
    cy.get("@onClickSpy").should("have.been.calledOnce");
  });
});
