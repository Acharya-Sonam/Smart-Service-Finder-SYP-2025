import ServiceModel from "../models/Service.js";

export const createService = async (req, res) => {
  const { title, description, category, price, location } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({ message: "title, category, and price are required" });
  }

  try {
    const insertId = await ServiceModel.create({
      provider_id: req.user.id,
      title,
      description: description || "",
      category,
      price,
      location,
    });

    return res.status(201).json({ message: "Service created successfully", serviceId: insertId });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllServices = async (req, res) => {
  const { category, min_price, max_price, location } = req.query;

  try {
    const services = await ServiceModel.findAll({ category, min_price, max_price, location });
    return res.status(200).json({ count: services.length, services });
  } catch (err) {
    console.error("getAllServices error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.status(200).json({ service });
  } catch (err) {
    console.error("getServiceById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyServices = async (req, res) => {
  try {
    const services = await ServiceModel.findByProviderId(req.user.id);
    return res.status(200).json({ count: services.length, services });
  } catch (err) {
    console.error("getMyServices error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateService = async (req, res) => {
  const { title, description, category, price, location, is_active } = req.body;

  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.provider_id !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own services" });
    }

    await ServiceModel.update(req.params.id, {
      title:       title       ?? service.title,
      description: description ?? service.description,
      category:    category    ?? service.category,
      price:       price       ?? service.price,
      location:    location    ?? service.location,
      is_active:   is_active   !== undefined ? is_active : service.is_active,
    });

    return res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.provider_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own services" });
    }

    await ServiceModel.delete(req.params.id);
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
