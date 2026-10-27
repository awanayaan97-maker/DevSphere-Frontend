
import { useEffect, useRef, useState } from "react";
import "./SortDropdown.css";

const sortOptions = [
{
value: "relevance",
label: "Best match",
icon: "fa-solid fa-bullseye",
},
{
value: "latest",
label: "Latest",
icon: "fa-solid fa-arrow-down-wide-short",
},
{
value: "oldest",
label: "Oldest",
icon: "fa-solid fa-arrow-up-wide-short",
},
{
value: "mostLiked",
label: "Most Liked",
icon: "fa-solid fa-heart",
},
];

function SortDropdown({ sort, handleSort, searchQuery = "" }) {
const [isOpen, setIsOpen] = useState(false);
const dropdownRef = useRef(null);

const options = sortOptions.filter(
(option) =>
option.value !== "relevance" || Boolean(searchQuery)
);

const selectedOption =
options.find((option) => option.value === sort) ||
options[0];

useEffect(() => {
function handleOutsideClick(event) {
if (
dropdownRef.current &&
!dropdownRef.current.contains(event.target)
) {
setIsOpen(false);
}
}


function handleEscape(event) {
  if (event.key === "Escape") {
    setIsOpen(false);
  }
}

document.addEventListener("mousedown", handleOutsideClick);
document.addEventListener("keydown", handleEscape);

return () => {
  document.removeEventListener("mousedown", handleOutsideClick);
  document.removeEventListener("keydown", handleEscape);
};


}, []);

function selectOption(value) {
handleSort({
target: { value },
});

setIsOpen(false);

}

return ( <div
   className="sort-dropdown"
   ref={dropdownRef}
 >
<button
type="button"
className={`sort-dropdown-trigger ${
          isOpen ? "sort-dropdown-trigger-open" : ""
        }`}
onClick={() => setIsOpen((prev) => !prev)}
aria-haspopup="listbox"
aria-expanded={isOpen}
>
<i
className={`sort-dropdown-selected-icon ${selectedOption.icon}`}
aria-hidden="true"
/>

    <span className="sort-dropdown-label">
      {selectedOption.label}
    </span>

    <i
      className={`fa-solid fa-chevron-down sort-dropdown-chevron ${
        isOpen ? "sort-dropdown-chevron-open" : ""
      }`}
      aria-hidden="true"
    />
  </button>

  {isOpen && (
    <div
      className="sort-dropdown-menu"
      role="listbox"
      aria-label="Sort posts"
    >
      {options.map((option) => {
        const isSelected = sort === option.value;

        return (
          <button
            type="button"
            key={option.value}
            className={`sort-dropdown-option ${
              isSelected
                ? "sort-dropdown-option-active"
                : ""
            }`}
            role="option"
            aria-selected={isSelected}
            onClick={() => selectOption(option.value)}
          >
            <i
              className={option.icon}
              aria-hidden="true"
            />

            <span>{option.label}</span>

            {isSelected && (
              <i
                className="fa-solid fa-check sort-dropdown-check"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  )}
</div>


);
}

export default SortDropdown;
