import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  AVAILABLE: "bg-green-100 text-green-700",
  BOOKED: "bg-red-100 text-red-700",
};

export default function Properties() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    description: "",
  });

  const [buildingForm, setBuildingForm] = useState({
    name: "",
  });

  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    type: "2BHK",
    price: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/properties/projects");

      setProjects(response.data);

      if (response.data.length > 0) {
        selectProject(response.data[0]);
      } else {
        setSelectedProject(null);
        setSelectedBuilding(null);
        setBuildings([]);
        setUnits([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    setSelectedProject(project);
    setSelectedBuilding(null);
    setUnits([]);
    setError("");

    try {
      const response = await api.get(
        `/properties/buildings?project_id=${project.id}`
      );

      setBuildings(response.data);

      if (response.data.length > 0) {
        selectBuilding(response.data[0]);
      } else {
        setSelectedBuilding(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load buildings"
      );
    }
  };

  const selectBuilding = async (building) => {
    setSelectedBuilding(building);
    setError("");

    try {
      const response = await api.get(
        `/properties/units?building_id=${building.id}`
      );

      setUnits(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load units"
      );
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();

    try {
      setError("");

      await api.post("/properties/projects", projectForm);

      setProjectForm({
        name: "",
        location: "",
        description: "",
      });

      setShowProjectForm(false);

      await fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create project"
      );
    }
  };

  const createBuilding = async (e) => {
    e.preventDefault();

    if (!selectedProject) return;

    try {
      setError("");

      await api.post("/properties/buildings", {
        project_id: selectedProject.id,
        name: buildingForm.name,
      });

      setBuildingForm({
        name: "",
      });

      setShowBuildingForm(false);

      await selectProject(selectedProject);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create building"
      );
    }
  };

  const createUnit = async (e) => {
    e.preventDefault();

    if (!selectedBuilding) return;

    try {
      setError("");

      await api.post("/properties/units", {
        building_id: selectedBuilding.id,
        unit_number: unitForm.unit_number,
        type: unitForm.type,
        price: Number(unitForm.price),
      });

      setUnitForm({
        unit_number: "",
        type: "2BHK",
        price: "",
      });

      setShowUnitForm(false);

      await selectBuilding(selectedBuilding);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create unit"
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />

        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Properties
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage projects, buildings and units
          </p>
        </div>

        {/* Admin only */}
        {isAdmin && (
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Projects */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Projects
            </h2>
          </div>

          <div className="p-3 space-y-2">

            {projects.length === 0 ? (
              <p className="text-sm text-slate-500 p-3">
                No projects yet.
              </p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => selectProject(project)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedProject?.id === project.id
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="font-medium">
                    {project.name}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      selectedProject?.id === project.id
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {project.location}
                  </p>
                </button>
              ))
            )}

          </div>
        </div>

        {/* Buildings */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

            <h2 className="font-semibold text-slate-900">
              Buildings
            </h2>

            {/* Admin only */}
            {isAdmin && selectedProject && (
              <button
                onClick={() => setShowBuildingForm(true)}
                className="text-sm font-medium text-slate-900 hover:text-slate-600"
              >
                + Add
              </button>
            )}

          </div>

          <div className="p-3 space-y-2">

            {!selectedProject ? (
              <p className="text-sm text-slate-500 p-3">
                Select a project.
              </p>
            ) : buildings.length === 0 ? (
              <p className="text-sm text-slate-500 p-3">
                No buildings yet.
              </p>
            ) : (
              buildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => selectBuilding(building)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedBuilding?.id === building.id
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="font-medium">
                    {building.name}
                  </p>
                </button>
              ))
            )}

          </div>
        </div>

        {/* Units */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Units
              </h2>

              {selectedBuilding && (
                <p className="text-xs text-slate-500 mt-1">
                  {selectedBuilding.name}
                </p>
              )}
            </div>

            {/* Admin only */}
            {isAdmin && selectedBuilding && (
              <button
                onClick={() => setShowUnitForm(true)}
                className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                + Add Unit
              </button>
            )}

          </div>

          <div className="overflow-x-auto">

            {units.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                {selectedBuilding
                  ? "No units in this building."
                  : "Select a building."}
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-500">
                      Unit
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-slate-500">
                      Type
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-slate-500">
                      Price
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 font-medium text-slate-900">
                        {unit.unit_number}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {unit.type}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹
                        {Number(unit.price).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[unit.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {unit.status}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            )}

          </div>
        </div>

      </div>

      {/* ==================== ADD PROJECT MODAL ==================== */}

      {showProjectForm && isAdmin && (
        <Modal
          title="Add Project"
          onClose={() => setShowProjectForm(false)}
        >
          <form
            onSubmit={createProject}
            className="space-y-4"
          >

            <Input
              label="Project Name"
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({
                  ...projectForm,
                  name: e.target.value,
                })
              }
              placeholder="Green Valley Residency"
              required
            />

            <Input
              label="Location"
              value={projectForm.location}
              onChange={(e) =>
                setProjectForm({
                  ...projectForm,
                  location: e.target.value,
                })
              }
              placeholder="Coimbatore"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>

              <textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              Create Project
            </button>

          </form>
        </Modal>
      )}

      {/* ==================== ADD BUILDING MODAL ==================== */}

      {showBuildingForm && isAdmin && (
        <Modal
          title="Add Building"
          onClose={() => setShowBuildingForm(false)}
        >
          <form
            onSubmit={createBuilding}
            className="space-y-4"
          >

            <p className="text-sm text-slate-500">
              Project:{" "}
              <span className="font-medium text-slate-900">
                {selectedProject?.name}
              </span>
            </p>

            <Input
              label="Building Name"
              value={buildingForm.name}
              onChange={(e) =>
                setBuildingForm({
                  name: e.target.value,
                })
              }
              placeholder="Block A"
              required
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              Create Building
            </button>

          </form>
        </Modal>
      )}

      {/* ==================== ADD UNIT MODAL ==================== */}

      {showUnitForm && isAdmin && (
        <Modal
          title="Add Unit"
          onClose={() => setShowUnitForm(false)}
        >
          <form
            onSubmit={createUnit}
            className="space-y-4"
          >

            <p className="text-sm text-slate-500">
              Building:{" "}
              <span className="font-medium text-slate-900">
                {selectedBuilding?.name}
              </span>
            </p>

            <Input
              label="Unit Number"
              value={unitForm.unit_number}
              onChange={(e) =>
                setUnitForm({
                  ...unitForm,
                  unit_number: e.target.value,
                })
              }
              placeholder="A-101"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>

              <select
                value={unitForm.type}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    type: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option>1BHK</option>
                <option>2BHK</option>
                <option>3BHK</option>
                <option>4BHK</option>
                <option>VILLA</option>
                <option>PLOT</option>
              </select>
            </div>

            <Input
              label="Price"
              type="number"
              value={unitForm.price}
              onChange={(e) =>
                setUnitForm({
                  ...unitForm,
                  price: e.target.value,
                })
              }
              placeholder="4500000"
              required
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              Create Unit
            </button>

          </form>
        </Modal>
      )}

    </div>
  );
}

/* ==================== MODAL ==================== */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">

          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 text-xl"
          >
            ×
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}

/* ==================== INPUT ==================== */

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 0 : undefined}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
      />

    </div>
  );
}